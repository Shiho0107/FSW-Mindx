import "./Button.css";

/**
 * @param {'primary'|'secondary'|'outline'|'ghost'} variant
 * @param {'sm'|'md'|'lg'} size
 */
const Button = ({
  children,
  variant = "primary",
  size = "md",
  className = "",
  leftIcon,
  ...props
}) => (
  <button
    className={["btn", `btn--${variant}`, `btn--${size}`, className].filter(Boolean).join(" ")}
    {...props}
  >
    {leftIcon && <span className="btn__icon">{leftIcon}</span>}
    {children}
  </button>
);

export default Button;
