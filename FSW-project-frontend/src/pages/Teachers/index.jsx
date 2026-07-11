import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import useFetch from "../../hooks/useFetch";
import teacherApi from "../../api/teacherApi";
import SearchBar from "../../components/common/SearchBar";
import Button from "../../components/common/Button";
import Pagination from "../../components/common/Pagination";
import { initials } from "../../utils/format";
import { Plus, Eye, Trash2, Phone, Mail } from "lucide-react";
import "./Teachers.css";

const ITEMS_PER_PAGE = 10;

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

      <div className="card tableCard">
        <div className="tableControls">
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
              <Button leftIcon={<Plus size={18} />} variant="primary">New Teacher</Button>
            </Link>
          </div>
        </div>

        <div className="tableWrapper">
          <table className="table dataTable">
            <thead>
              <tr>
                <th>
                  <input type="checkbox" className="rowCheck" />
                </th>
                <th>Name</th>
                <th>ID</th>
                <th>Date</th>
                <th>Subject</th>
                <th>City</th>
                <th>Contact</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {currentData.length === 0 ? (
                <tr>
                  <td colSpan={8} className="emptyTable">No teachers found.</td>
                </tr>
              ) : (
                currentData.map(teacher => (
                  <tr key={teacher._id}>
                    <td>
                      <input type="checkbox" className="rowCheck" />
                    </td>
                    <td>
                      <div className="studentCell">
                        <div className="miniAvatar">
                          {teacher.photo ? (
                            <img 
                              src={teacher.photo} 
                              alt={`${teacher.firstName} ${teacher.lastName}`} 
                              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} 
                            />
                          ) : (
                            initials(`${teacher.firstName} ${teacher.lastName}`)
                          )}
                        </div>
                        <span className="boldText">{teacher.firstName} {teacher.lastName}</span>
                      </div>
                    </td>
                    <td className="mutedText">#{teacher._id?.slice(-9).toUpperCase() || "—"}</td>
                    <td>{new Date(teacher.createdAt).toLocaleDateString("en-US", { month: 'long', day: 'numeric', year: 'numeric'})}</td>
                    <td>{teacher.subject || "—"}</td>
                    <td>{teacher.city || teacher.address || "—"}</td>
                    <td>
                      <div className="contactRow" style={{ display: 'flex', gap: '4px' }}>
                        <button className="iconBtn smallBtn" title="Call"><Phone size={14} /></button>
                        <button className="iconBtn smallBtn" title="Email"><Mail size={14} /></button>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "8px", alignItems: 'center' }}>
                        <Link to={`/teachers/${teacher._id}`} title="View" style={{ display: 'inline-flex', alignItems: 'center' }}>
                          <Eye size={16} style={{ color: "var(--color-primary)" }} />
                        </Link>
                        <button 
                          onClick={() => handleDelete(teacher._id)} 
                          title="Delete" 
                          style={{ border: "none", background: "none", cursor: "pointer", display: 'inline-flex', alignItems: 'center', padding: 0 }}
                        >
                          <Trash2 size={16} style={{ color: "var(--color-danger)" }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalItems > 0 && (
          <div className="paginationContainer">
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
    </div>
  );
};

export default Teachers;
