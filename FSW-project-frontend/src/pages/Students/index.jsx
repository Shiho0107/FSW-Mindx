import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import useFetch from "../../hooks/useFetch";
import studentApi from "../../api/studentApi";
import SearchBar from "../../components/common/SearchBar";
import Button from "../../components/common/Button";
import Pagination from "../../components/common/Pagination";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { initials } from "../../utils/format";
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
  useMemo(() => { setCurrentPage(1); }, [searchTerm, sortOrder]);

  if (loading && !localData.length) return <LoadingSpinner message="Loading students…" />;
  if (error) return <LoadingSpinner message="Failed to load students." />;

  return (
    <div className="studentsPage">
      <div className="pageHeader">
        <h1 className="pageTitle">Students</h1>
      </div>

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
              <Button leftIcon="➕" variant="primary">New Student</Button>
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
                      <div className="contactRow">
                        <button className="iconBtn smallBtn" title="Call">📞</button>
                        <button className="iconBtn smallBtn" title="Email">✉️</button>
                      </div>
                    </td>
                    <td>
                      <span className={`gradeBadge grade-${student.grade?.replace(' ', '-')}`}>{student.grade || "—"}</span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <Link to={`/students/${student._id}`} title="View"><span style={{fontSize: 16}}>👁️</span></Link>
                        <button onClick={() => handleDelete(student._id)} title="Delete" style={{fontSize: 16, color: "var(--color-danger)"}}>🗑️</button>
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

export default Students;
