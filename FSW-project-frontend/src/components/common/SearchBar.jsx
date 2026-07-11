import { Search } from "lucide-react";
import "./SearchBar.css";

const SearchBar = ({ value, onChange, placeholder = "Search here...", className = "" }) => (
  <div className={["searchBar", className].join(" ")}>
    <Search className="searchBar__icon" size={18} style={{ color: "var(--color-muted)" }} />
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
