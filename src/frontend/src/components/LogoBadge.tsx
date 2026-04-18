import { useState } from "react";

const LOGO_URL = "https://i.ibb.co/H0RBYF/your-image.png";
const SCHOOL_NAME = "Maktab Zaid Bin Sabit";

const sizeMap = {
  sm: { cls: "w-10 h-10", text: "text-sm" },
  md: { cls: "w-14 h-14", text: "text-lg" },
  lg: { cls: "w-20 h-20", text: "text-2xl" },
};

interface LogoBadgeProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  withGoldRing?: boolean;
}

export default function LogoBadge({
  size = "md",
  className = "",
  withGoldRing = false,
}: LogoBadgeProps) {
  const [imgError, setImgError] = useState(false);
  const { cls, text } = sizeMap[size];
  const initials = SCHOOL_NAME.split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("");

  if (imgError) {
    return (
      <div
        className={`${cls} rounded-full flex items-center justify-center bg-primary/20 text-primary font-bold shrink-0 border-2 border-primary/30 ${withGoldRing ? "logo-gold-ring" : "shadow-md"} ${className}`}
      >
        <span className={text}>{initials}</span>
      </div>
    );
  }

  return (
    <img
      src={LOGO_URL}
      alt={SCHOOL_NAME}
      className={`${cls} rounded-full object-cover shrink-0 border-2 border-white/30 ${withGoldRing ? "logo-gold-ring" : "shadow-md"} ${className}`}
      onError={() => setImgError(true)}
    />
  );
}
