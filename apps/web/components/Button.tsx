// components/Button.tsx

interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  type?: "button" | "submit" | "reset"
  className?: string
  fullWidth?: boolean
}

export default function Button({
  children,
  onClick,
  disabled = false,
  type = "button",
  className = "",
  fullWidth = false,
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        bg-white text-black font-semibold
        px-6 py-3 rounded-md
        border border-white
        transition-all duration-150
        hover:bg-transparent hover:text-white
        active:scale-95
        disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100
        ${fullWidth ? "w-full" : ""}
        ${className}
      `}
    >
      {children}
    </button>
  )
}
