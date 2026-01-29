"use client";

import { useState } from "react";

interface NeonBookButtonProps {
  onClick?: () => void;
  className?: string;
  children?: React.ReactNode;
  disabled?: boolean;
  isSelected?: boolean;
}

export function NeonBookButton({
  onClick,
  className = "",
  children = "BOOK",
  disabled = false,
  isSelected = false,
}: NeonBookButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Selected state styling (green background)
  const getBackgroundColor = () => {
    if (disabled) return "#333";
    if (isSelected) return isHovered ? "#16a34a" : "#22c55e"; // green-600 : green-500
    return isHovered ? "#FFFFFF" : "#1A1A1A";
  };

  const getBorderColor = () => {
    if (disabled) return "0.5px solid #555";
    if (isSelected) return isHovered ? "0.5px solid #16a34a" : "0.5px solid #22c55e";
    return isHovered ? "0.5px solid #FFFFFF" : "0.5px solid rgba(255, 255, 255, 0.6)";
  };

  const getTextColor = () => {
    if (disabled) return "#666";
    if (isSelected) return "#FFFFFF";
    return isHovered ? "#19181E" : "#FFFFFF";
  };

  const getBoxShadow = () => {
    if (disabled) return "none";
    if (isSelected) return isHovered ? "0 4px 20px rgba(34, 197, 94, 0.4)" : "0 4px 20px rgba(34, 197, 94, 0.3)";
    return isHovered ? "0 4px 20px rgba(255, 255, 255, 0.3)" : "none";
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative cursor-pointer flex items-center justify-center px-8 md:px-12 py-3 md:py-4 text-[14px] md:text-[20px] rounded-md transition-all duration-300 font-bold disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      style={{
        backgroundColor: getBackgroundColor(),
        border: getBorderColor(),
        color: getTextColor(),
        fontWeight: 700,
        lineHeight: 1,
        boxShadow: getBoxShadow(),
      }}
    >
      {children}
    </button>
  );
}
