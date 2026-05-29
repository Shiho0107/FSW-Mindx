import "./LoadingSpinner.css";

/**
 * LoadingSpinner — centered spinner for page-level loading states.
 * Replaces the inline `<div className="stateBox"><div className="spinner" /></div>` pattern.
 *
 * Props:
 *   size    - "sm" | "md" | "lg"  (default "md")
 *   message - optional text below spinner
 *   full    - bool, if true fills the parent container (default true)
 */
const LoadingSpinner = ({ size = "md", message, full = true }) => (
  <div className={`loadingSpinner${full ? " full" : ""}`}>
    <div className={`spinnerRing ${size}`} />
    {message && <p className="spinnerMsg">{message}</p>}
  </div>
);

export default LoadingSpinner;
