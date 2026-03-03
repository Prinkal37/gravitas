import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { GravitasLogo } from "@/components/GravitasLogo";
import { ArrowLeft } from "lucide-react";

const schema = z.object({
  email: z.string().email("Enter a valid email address"),
});

type ForgotForm = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<ForgotForm>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: ForgotForm) => {
    console.log("Reset password for:", data.email);
    await new Promise((r) => setTimeout(r, 800));
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-10">
          <GravitasLogo />
        </div>

        <div className="surface rounded-sm p-8">
          {isSubmitSuccessful ? (
            <div className="text-center py-4">
              <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-success text-lg">✓</span>
              </div>
              <h2 className="text-base font-semibold mb-2">Check your email</h2>
              <p className="text-sm text-muted-foreground">
                If that address is registered, you'll receive a reset link shortly.
              </p>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-semibold mb-1">Reset password</h1>
              <p className="text-sm text-muted-foreground mb-7">
                Enter your email and we'll send a reset link.
              </p>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Email</label>
                  <input {...register("email")} type="email" placeholder="you@company.com" className="executive-input" />
                  {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
                </div>
                <button type="submit" disabled={isSubmitting} className="btn-primary w-full mt-2">
                  {isSubmitting ? "Sending..." : "Send reset link"}
                </button>
              </form>
            </>
          )}
        </div>

        <div className="flex justify-center mt-6">
          <Link to="/login" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft size={14} />
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
