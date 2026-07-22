import "./Button.css";

interface ButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
}

export default function Button({
  children,
  variant = "primary",
  type = "button",
  onClick,
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`button button--${variant}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}