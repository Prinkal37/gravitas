import gravitasLogo from "@/assets/gravitas_logo.jpeg";

export function GravitasLogo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <img src={gravitasLogo} alt="Gravitas" className="h-7 w-7 object-contain rounded-sm" />
      <span className="text-lg font-semibold tracking-tight text-foreground">Gravitas</span>
    </div>
  );
}
