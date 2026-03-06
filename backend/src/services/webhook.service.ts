import crypto from "crypto";
import { Prisma, SubscriptionStatus, CreditLedgerType } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { env } from "../lib/env";

type RazorpayWebhookBody = {
  id?: string;
  event?: string;
  payload?: unknown;
};

type RazorpayPayload = {
  subscription?: {
    entity?: {
      id?: string;
      current_end?: number;
      current_period_end?: number;
    };
  };
  invoice?: {
    entity?: {
      id?: string;
      subscription_id?: string;
      period_end?: number;
      end_at?: number;
    };
  };
};

const getSubscriptionIdFromPayload = (payload: RazorpayPayload): string | null => {
  const subId =
    payload.subscription?.entity?.id ??
    payload.invoice?.entity?.subscription_id ??
    null;

  if (!subId || typeof subId !== "string" || subId.length === 0) {
    return null;
  }

  return subId;
};

const getCurrentPeriodEndFromPayload = (
  payload: RazorpayPayload
): Date | undefined => {
  const raw =
    payload.subscription?.entity?.current_period_end ??
    payload.subscription?.entity?.current_end ??
    payload.invoice?.entity?.period_end ??
    payload.invoice?.entity?.end_at;

  if (typeof raw === "number") {
    const millis = raw > 1e12 ? raw : raw * 1000;
    return new Date(millis);
  }

  return undefined;
};

export const handleRazorpayEvent = async (
  body: unknown,
  signature?: string,
  rawBody?: string
): Promise<void> => {
  const { id, event, payload } = (body ?? {}) as RazorpayWebhookBody;

  if (!id || !event) {
    throw new Error("Invalid Razorpay webhook payload");
  }

  const providedSignature = signature;
  const payloadString =
    typeof rawBody === "string" ? rawBody : JSON.stringify(body);

  if (!providedSignature) {
    throw new Error("Missing Razorpay signature");
  }

  const expectedSignature = crypto
    .createHmac("sha256", env.RAZORPAY_WEBHOOK_SECRET)
    .update(payloadString, "utf8")
    .digest("hex");

  const sigA = Buffer.from(providedSignature);
  const sigB = Buffer.from(expectedSignature);

  if (sigA.length !== sigB.length || !crypto.timingSafeEqual(sigA, sigB)) {
    throw new Error("Invalid Razorpay signature");
  }

  try {
    await prisma.$transaction(async (tx) => {
      const existing = await tx.paymentEvent.findUnique({
        where: {
          razorpayEventId: id,
        },
      });

      if (existing) {
        return;
      }

      await tx.paymentEvent.create({
        data: {
          razorpayEventId: id,
          type: event,
          payload: body as Prisma.InputJsonValue,
        },
      });

      if (!payload || typeof payload !== "object") {
        return;
      }

      const payloadTyped = payload as RazorpayPayload;

      switch (event) {
        case "invoice.paid": {
          const razorpaySubscriptionId =
            getSubscriptionIdFromPayload(payloadTyped);
          if (!razorpaySubscriptionId) {
            return;
          }

          const subscription = await tx.subscription.findUnique({
            where: { razorpaySubscriptionId },
          });

          if (!subscription) {
            return;
          }

          const invoiceId = payloadTyped.invoice?.entity?.id;

          const periodEnd =
            getCurrentPeriodEndFromPayload(payloadTyped) ??
            subscription.currentPeriodEnd;

          await tx.subscription.update({
            where: { razorpaySubscriptionId },
            data: {
              status: SubscriptionStatus.ACTIVE,
              currentPeriodEnd: periodEnd,
            },
          });

          if (subscription.monthlyCreditLimit > 0) {
            if (invoiceId && typeof invoiceId === "string") {
              const existingCredit = await tx.creditLedger.findFirst({
                where: { referenceId: invoiceId },
              });

              if (existingCredit) {
                return;
              }
            }

            await tx.creditLedger.create({
              data: {
                userId: subscription.userId,
                amount: subscription.monthlyCreditLimit,
                type: CreditLedgerType.SUBSCRIPTION_CREDIT,
                description: "Monthly subscription credits",
                referenceId:
                  invoiceId && typeof invoiceId === "string"
                    ? invoiceId
                    : undefined,
              },
            });
          }
          break;
        }

        case "subscription.activated": {
          const razorpaySubscriptionId =
            getSubscriptionIdFromPayload(payloadTyped);
          if (!razorpaySubscriptionId) {
            return;
          }

          const periodEnd = getCurrentPeriodEndFromPayload(payloadTyped);

          await tx.subscription.update({
            where: { razorpaySubscriptionId },
            data: periodEnd
              ? {
                  status: SubscriptionStatus.ACTIVE,
                  currentPeriodEnd: periodEnd,
                }
              : { status: SubscriptionStatus.ACTIVE },
          });
          break;
        }

        case "subscription.cancelled": {
          const razorpaySubscriptionId =
            getSubscriptionIdFromPayload(payloadTyped);
          if (!razorpaySubscriptionId) {
            return;
          }

          await tx.subscription.update({
            where: { razorpaySubscriptionId },
            data: {
              status: SubscriptionStatus.CANCELLED,
            },
          });
          break;
        }

        case "invoice.payment_failed": {
          const razorpaySubscriptionId =
            getSubscriptionIdFromPayload(payloadTyped);
          if (!razorpaySubscriptionId) {
            return;
          }

          await tx.subscription.update({
            where: { razorpaySubscriptionId },
            data: {
              status: SubscriptionStatus.PAST_DUE,
            },
          });
          break;
        }

        default:
          break;
      }
    });
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      return;
    }
    throw err;
  }
};

