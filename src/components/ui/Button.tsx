import React from "react";
import { cn } from "../../lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'link' | 'gold';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fafe-orange disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-[#E67E22] text-white hover:scale-105 shadow-lg shadow-[#E67E22]/20 rounded-full font-bold": variant === "default",
            "bg-[#D4AF37] text-[#6B3E1E] hover:brightness-110 shadow-lg font-bold rounded-lg": variant === "gold",
            "border border-[#E67E22] bg-transparent text-[#E67E22] hover:bg-orange-50": variant === "outline",
            "hover:bg-orange-50 text-[#6B3E1E]": variant === "ghost",
            "text-[#E67E22] underline-offset-4 hover:underline": variant === "link",
            "h-10 px-4 py-2": size === "default",
            "h-9 rounded-md px-3": size === "sm",
            "h-12 rounded-md px-8 text-base": size === "lg",
            "h-10 w-10": size === "icon",
          },
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
