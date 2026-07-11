import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/common/ProtectedRoute";
import MainLayout from "./components/layout/MainLayout";

// Pages
import Login from "./pages/Login/index";
import Dashboard from "./pages/Dashboard/index";
import Students from "./pages/Students/index";
import StudentDetails from "./pages/Students/StudentDetails";
import AddStudent from "./pages/Students/AddStudent/index";
import Teachers from "./pages/Teachers/index";
import TeacherDetails from "./pages/Teachers/TeacherDetails";
import AddTeacher from "./pages/Teachers/AddTeacher/index";
import Events from "./pages/Events/index";
import AddEvent from "./pages/Events/AddEvent/index";
import EditEvent from "./pages/Events/EditEvent/index";
import UserDashboard from "./pages/User/index";
import MyCalendar from "./pages/MyCalendar/index";
import Accounts from "./pages/Accounts/index";
import NotFound from "./pages/NotFound/index";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />

          {/* Protected — any authenticated user */}
          <Route
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            {/* Admin-only routes */}
            <Route index element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="students" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Students />
              </ProtectedRoute>
            } />
            <Route path="students/:id" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <StudentDetails />
              </ProtectedRoute>
            } />
            <Route path="students/add" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AddStudent />
              </ProtectedRoute>
            } />
            <Route path="teachers" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Teachers />
              </ProtectedRoute>
            } />
            <Route path="teachers/:id" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <TeacherDetails />
              </ProtectedRoute>
            } />
            <Route path="teachers/add" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AddTeacher />
              </ProtectedRoute>
            } />
            <Route path="events" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Events />
              </ProtectedRoute>
            } />
            <Route path="events/add" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AddEvent />
              </ProtectedRoute>
            } />
            <Route path="events/:id/edit" element={
              <ProtectedRoute allowedRoles={["admin", "teacher"]}>
                <EditEvent />
              </ProtectedRoute>
            } />
            <Route path="accounts" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Accounts />
              </ProtectedRoute>
            } />
            <Route path="user" element={
              <ProtectedRoute allowedRoles={["admin", "student", "teacher"]}>
                <UserDashboard />
              </ProtectedRoute>
            } />

            {/* Student + Teacher routes */}
            <Route path="calendar" element={
              <ProtectedRoute allowedRoles={["student", "teacher"]}>
                <MyCalendar />
              </ProtectedRoute>
            } />

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Route>

          {/* Root redirect if nothing matches */}
          <Route path="" element={<Navigate to="/login" replace />} />
        </Routes>
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
