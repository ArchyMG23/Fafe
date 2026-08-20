import React from "react";
import { cn } from "../../lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-md border bg-white px-3 py-2 text-sm text-[#6B3E1E] ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[#6B3E1E]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E67E22] focus-visible:border-[#E67E22] disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
          error ? "border-red-500 focus-visible:ring-red-500" : "border-[#6B3E1E]/20 hover:border-[#6B3E1E]/40",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
