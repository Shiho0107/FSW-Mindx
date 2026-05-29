import "./Pagination.css";

/**
 * @param {number} currentPage  1-indexed
 * @param {number} totalPages
 * @param {Function} onPageChange (page: number) => void
 */
const Pagination = ({ currentPage, totalPages, totalItems, perPage = 5, onPageChange }) => {
  if (totalPages <= 1) return null;

  // Build visible page numbers (always show at most 5 around current)
  const pages = [];
  const start = Math.max(1, currentPage - 2);
  const end   = Math.min(totalPages, start + 4);
  for (let i = start; i <= end; i++) pages.push(i);

  const from = (currentPage - 1) * perPage + 1;
  const to   = Math.min(currentPage * perPage, totalItems);

  return (
    <div className="pagination">
      <span className="paginationInfo">
        Showing {from}–{to} from {totalItems} data
      </span>
      <div className="paginationControls">
        <button
          className="pageBtn"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          aria-label="Previous page"
        >
          ‹
        </button>

        {pages.map((p) => (
          <button
            key={p}
            className={["pageBtn", p === currentPage ? "pageBtn--active" : ""].join(" ")}
            onClick={() => onPageChange(p)}
            aria-current={p === currentPage ? "page" : undefined}
          >
            {p}
          </button>
        ))}

        <button
          className="pageBtn"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          aria-label="Next page"
        >
          ›
        </button>
      </div>
    </div>
  );
};

export default Pagination;
