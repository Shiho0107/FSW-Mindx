import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import useFetch from "../../hooks/useFetch";
import teacherApi from "../../api/teacherApi";
import SearchBar from "../../components/common/SearchBar";
import Button from "../../components/common/Button";
import Pagination from "../../components/common/Pagination";
import { initials } from "../../utils/format";
import "./Teachers.css";

const ITEMS_PER_PAGE = 12;

const Teachers = () => {
  const [localData, setLocalData] = useState([]);
  const handleFetchSuccess = (fetchedData) => setLocalData(fetchedData);
  const { data: teachers, loading, error } = useFetch(teacherApi.getAll, [], handleFetchSuccess);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState("Newest");

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this teacher?")) return;
    try {
      await teacherApi.remove(id);
      setLocalData(prev => prev.filter(t => t._id !== id));
      toast.success("Teacher deleted successfully!");
    } catch (err) {
      toast.error("Failed to delete teacher: " + err.message);
    }
  };

  // Filtering & Sorting
  const processedData = useMemo(() => {
    let targetData = localData.length ? localData : (teachers || []);
    
    // 1. Filter
    let filtered = targetData;
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = targetData.filter(t => 
        t.firstName?.toLowerCase().includes(lowerSearch) || 
        t.lastName?.toLowerCase().includes(lowerSearch) ||
        t.subject?.toLowerCase().includes(lowerSearch)
      );
    }

    // 2. Sort
    filtered = [...filtered].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === "Newest" ? dateB - dateA : dateA - dateB;
    });

    return filtered;
  }, [teachers, localData, searchTerm, sortOrder]);

  // Pagination Compute
  const totalItems = processedData.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;
  const currentData = processedData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset page row when searching or sorting changes
  useMemo(() => { setCurrentPage(1); }, [searchTerm, sortOrder]);

  if (loading && !localData.length) return <div className="stateBox"><div className="spinner" /></div>;
  if (error) return <div className="stateBox errorMsg">Failed to load teachers.</div>;

  return (
    <div className="teachersPage">
      <div className="pageHeader">
        <h1 className="pageTitle">Teachers</h1>
      </div>

      <div className="teachersTopBar">
        <SearchBar 
          value={searchTerm} 
          onChange={setSearchTerm} 
          placeholder="Search here..." 
          className="teacherSearch"
        />
        <div className="tableActions">
          <select 
            className="sortSelect"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="Newest">Newest</option>
            <option value="Oldest">Oldest</option>
          </select>
          <Link to="/teachers/add">
            <Button leftIcon="➕" variant="primary">New Teacher</Button>
          </Link>
        </div>
      </div>

      {currentData.length === 0 ? (
        <div className="stateBox">No teachers found.</div>
      ) : (
        <div className="teacherGrid">
          {currentData.map(teacher => (
            <div key={teacher._id} className="teacherCard">
              <div className="teacherCardOptions" style={{ display: 'flex', gap: '8px' }}>
                <Link to={`/teachers/${teacher._id}`} title="View" style={{ textDecoration: 'none' }}>
                  <span style={{ fontSize: 16 }}>👁️</span>
                </Link>
                <button 
                  onClick={() => handleDelete(teacher._id)} 
                  title="Delete" 
                  className="iconBtn" 
                  style={{ color: "var(--color-danger)", padding: 0 }}
                >
                  🗑️
                </button>
              </div>

              
              <div className="teacherAvatarBlock">
                <div className="largeAvatar">
                  {teacher.photo ? <img src={teacher.photo} alt={teacher.firstName} /> : initials(`${teacher.firstName} ${teacher.lastName}`)}
                </div>
                <h3 className="teacherName">{teacher.firstName} {teacher.lastName}</h3>
                <p className="teacherSubject">{teacher.subject}</p>
              </div>
              
              <div className="teacherContactBlock">
                <button className="iconSquareBtn" title="Call">📞</button>
                <button className="iconSquareBtn" title="Email">✉️</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalItems > 0 && (
        <div className="teacherPagination">
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            perPage={ITEMS_PER_PAGE}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
};

export default Teachers;
