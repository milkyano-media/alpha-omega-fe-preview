"use client";

import { useState } from "react";

interface NeonBookButtonProps {
  onClick?: () => void;
  className?: string;
  children?: React.ReactNode;
  disabled?: boolean;
}

export function NeonBookButton({
  onClick,
  className = "",
  children = "BOOK NOW",
  disabled = false,
}: NeonBookButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative cursor-pointer flex items-center justify-center px-8 md:px-12 py-3 md:py-4 text-[14px] md:text-[20px] rounded-md transition-all duration-300 font-bold disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      style={{
        backgroundColor: disabled
          ? "#333"
          : isHovered
            ? "#FFFFFF"
            : "#1A1A1A",
        border: disabled
          ? "0.5px solid #555"
          : isHovered
            ? "0.5px solid #FFFFFF"
            : "0.5px solid rgba(255, 255, 255, 0.6)",
        color: disabled ? "#666" : isHovered ? "#19181E" : "#FFFFFF",
        fontWeight: 700,
        lineHeight: 1,
        boxShadow: disabled
          ? "none"
          : isHovered
            ? "0 4px 20px rgba(255, 255, 255, 0.3)"
            : "none",
      }}
    >
      {children}
    </button>
  );
}
