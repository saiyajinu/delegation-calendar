import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
  isLoading?: boolean;
};

const variants = {
  primary:
    "bg-rose-600 text-white hover:bg-rose-700 disabled:bg-rose-300",
  secondary:
    "border border-rose-200 bg-white text-rose-900 hover:bg-rose-50 disabled:text-rose-300",
  ghost: "text-rose-700 hover:bg-rose-100 hover:text-rose-950",
};

export function Button({
  variant = "primary",
  isLoading,
  className = "",
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      {...props}
    >
      {isLoading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  );
}
