import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import useFetch from "../../hooks/useFetch";
import studentApi from "../../api/studentApi";
import SearchBar from "../../components/common/SearchBar";
import Button from "../../components/common/Button";
import Pagination from "../../components/common/Pagination";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import StudentGroups from "./StudentGroups";
import { initials } from "../../utils/format";
import { Plus, Phone, Mail, Eye, Trash2, Users, UserCheck } from "lucide-react";
import "./Students.css";

const ITEMS_PER_PAGE = 10;

const Students = () => {
  // Use a local state clone to execute optimistic deletes without unnecessrily refetching
  const [localData, setLocalData] = useState([]);
  
  const handleFetchSuccess = (fetchedData) => setLocalData(fetchedData);
  const { data: students, loading, error } = useFetch(studentApi.getAll, [], handleFetchSuccess);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState("Newest");
  const [activeTab, setActiveTab] = useState("all"); // "all" | "groups"

  // Local optimistic Delete handler
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this student?")) return;
    try {
      await studentApi.remove(id);
      setLocalData(prev => prev.filter(s => s._id !== id));
      toast.success("Student deleted successfully!");
    } catch (err) {
      toast.error("Failed to delete student: " + err.message);
    }
  };

  // Filtering & Sorting
  const processedData = useMemo(() => {
    // If localData is empty but hook is loading, wait. Otherwise use localData.
    let targetData = localData.length ? localData : (students || []);
    
    // 1. Filter
    let filtered = targetData;
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = targetData.filter(s => 
        s.firstName?.toLowerCase().includes(lowerSearch) || 
        s.lastName?.toLowerCase().includes(lowerSearch)
      );
    }

    // 2. Sort
    filtered = [...filtered].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === "Newest" ? dateB - dateA : dateA - dateB;
    });

    return filtered;
  }, [students, localData, searchTerm, sortOrder]);

  // Pagination Compute
  const totalItems = processedData.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;
  const currentData = processedData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset page row when searching or sorting changes
  useEffect(() => { setCurrentPage(1); }, [searchTerm, sortOrder]);

  if (loading && !localData.length) return <LoadingSpinner message="Loading students…" />;
  if (error) return <LoadingSpinner message="Failed to load students." />;

  return (
    <div className="studentsPage">
      <div className="pageHeader" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h1 className="pageTitle">Students</h1>
        
        {/* TAB TOGGLE */}
        <div style={{ display: "flex", background: "#E2E8F0", padding: "4px", borderRadius: "24px" }}>
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            style={{
              border: "none",
              background: activeTab === "all" ? "#FFFFFF" : "transparent",
              color: activeTab === "all" ? "var(--color-primary)" : "#64748B",
              padding: "8px 18px",
              borderRadius: "20px",
              fontWeight: 600,
              fontSize: "13px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              boxShadow: activeTab === "all" ? "0 2px 6px rgba(0,0,0,0.08)" : "none",
              transition: "all 0.2s ease"
            }}
          >
            <UserCheck size={16} /> All Students
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("groups")}
            style={{
              border: "none",
              background: activeTab === "groups" ? "#FFFFFF" : "transparent",
              color: activeTab === "groups" ? "var(--color-primary)" : "#64748B",
              padding: "8px 18px",
              borderRadius: "20px",
              fontWeight: 600,
              fontSize: "13px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              boxShadow: activeTab === "groups" ? "0 2px 6px rgba(0,0,0,0.08)" : "none",
              transition: "all 0.2s ease"
            }}
          >
            <Users size={16} /> Preset Groups (Cohorts)
          </button>
        </div>
      </div>

      {activeTab === "groups" ? (
        <StudentGroups />
      ) : (

      <div className="card tableCard">
        <div className="tableControls">
          <SearchBar 
            value={searchTerm} 
            onChange={setSearchTerm} 
            placeholder="Search here..." 
            className="studentSearch"
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
            <Link to="/students/add">
              <Button leftIcon={<Plus size={18} />} variant="primary">New Student</Button>
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
                <th>Parent Name</th>
                <th>City</th>
                <th>Contact</th>
                <th>Grade</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {currentData.length === 0 ? (
                <tr>
                  <td colSpan={9} className="emptyTable">No students found.</td>
                </tr>
              ) : (
                currentData.map(student => (
                  <tr key={student._id}>
                    <td>
                      <input type="checkbox" className="rowCheck" />
                    </td>
                    <td>
                      <div className="studentCell">
                        <div className="miniAvatar">
                          {initials(`${student.firstName} ${student.lastName}`)}
                        </div>
                        <span className="boldText">{student.firstName} {student.lastName}</span>
                      </div>
                    </td>
                    <td className="mutedText">#{student._id?.slice(-9).toUpperCase() || "—"}</td>
                    <td>{new Date(student.createdAt).toLocaleDateString("en-US", { month: 'long', day: 'numeric', year: 'numeric'})}</td>
                    <td>{student.parentName || "—"}</td>
                    <td>{student.city || "—"}</td>
                    <td>
                      <div className="contactRow" style={{ display: 'flex', gap: '4px' }}>
                        <button className="iconBtn smallBtn" title="Call"><Phone size={14} /></button>
                        <button className="iconBtn smallBtn" title="Email"><Mail size={14} /></button>
                      </div>
                    </td>
                    <td>
                      <span className={`gradeBadge grade-${student.grade?.replace(' ', '-')}`}>{student.grade || "—"}</span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "8px", alignItems: 'center' }}>
                        <Link to={`/students/${student._id}`} title="View" style={{ display: 'inline-flex', alignItems: 'center' }}>
                          <Eye size={16} style={{ color: "var(--color-primary)" }} />
                        </Link>
                        <button 
                          onClick={() => handleDelete(student._id)} 
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
      )}
    </div>
  );
};

export default Students;
