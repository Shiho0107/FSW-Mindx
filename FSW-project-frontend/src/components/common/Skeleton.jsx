import "./Skeleton.css";

/**
 * Skeleton — content placeholder for perceived performance.
 * Renders a shimmering grey box of configurable size.
 *
 * Props:
 *   width   - CSS width string (default "100%")
 *   height  - CSS height string (default "16px")
 *   rounded - bool, if true uses border-radius 8px (default false)
 *   style   - additional inline styles
 */
const Skeleton = ({ width = "100%", height = "16px", rounded = false, style }) => (
  <div
    className={`skeleton${rounded ? " rounded" : ""}`}
    style={{ width, height, ...style }}
    aria-busy="true"
    aria-label="Loading…"
  />
);

/**
 * SkeletonCard — a pre-built card skeleton for list pages.
 * Shows avatar + two lines of text.
 */
export const SkeletonCard = () => (
  <div className="skeletonCard">
    <Skeleton width="48px" height="48px" rounded style={{ flexShrink: 0 }} />
    <div className="skeletonLines">
      <Skeleton width="60%" height="14px" />
      <Skeleton width="40%" height="12px" />
    </div>
  </div>
);

export default Skeleton;
