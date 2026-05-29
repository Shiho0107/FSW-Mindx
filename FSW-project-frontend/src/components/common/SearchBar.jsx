import "./SearchBar.css";

const SearchBar = ({ value, onChange, placeholder = "Search here...", className = "" }) => (
  <div className={["searchBar", className].join(" ")}>
    <span className="searchBar__icon">🔍</span>
    <input
      className="searchBar__input"
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      aria-label={placeholder}
    />
  </div>
);

export default SearchBar;
