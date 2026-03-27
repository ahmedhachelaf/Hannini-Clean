import type { LucideIcon } from "lucide-react";

type IconBadgeProps = {
  icon: LucideIcon;
  size?: number;
  className?: string;
  tone?: "soft" | "solid";
};

export function IconBadge({ icon: Icon, size = 18, className = "", tone = "soft" }: IconBadgeProps) {
  const toneClass =
    tone === "solid"
      ? "border-[rgba(20,92,255,0.2)] bg-[linear-gradient(135deg,rgba(12,60,164,0.96),rgba(24,94,214,0.92))] text-white"
      : "border-[rgba(15,95,255,0.16)] bg-white text-[var(--navy)]";

  return (
    <span
      className={`inline-flex h-10 w-10 items-center justify-center rounded-[1rem] border shadow-[0_10px_22px_rgba(12,40,104,0.12)] ${toneClass} ${className}`}
      aria-hidden="true"
    >
      <Icon size={size} strokeWidth={2.1} />
    </span>
  );
}
