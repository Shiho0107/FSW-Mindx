import { useState, useEffect, useMemo } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import useFetch from "../../hooks/useFetch";
import accountApi from "../../api/accountApi";
import eventApi from "../../api/eventApi";
import teacherApi from "../../api/teacherApi";
import Button from "../../components/common/Button";
import { hashPassword } from "../../utils/hashPassword";
import { getTeacherName } from "../../utils/format";
import "./User.css";

const UserDashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    password: ""
  });

  const { data: allEvents, loading: loadingEvents } = useFetch(eventApi.getAll, []);
  const { data: teachers } = useFetch(teacherApi.getAll, []);
  const teacherList = teachers || [];

  const recentClasses = useMemo(() => {
    let list = allEvents || [];
    if (user?.role === "student" && user?.linkedProfileId) {
      list = list.filter(e => Array.isArray(e.attendees) && e.attendees.includes(user.linkedProfileId));
    } else if (user?.role === "teacher" && user?.linkedProfileId) {
      list = list.filter(e => e.teacherId === user.linkedProfileId);
    }
    
    // Filter to only include classes that ended before the current local time
    const now = new Date();
    list = list.filter(e => {
      if (!e.date) return false;
      const classEndStr = `${e.date}T${e.endTime || "23:59"}`;
      const classEndTime = new Date(classEndStr);
      return classEndTime < now;
    });

    // Sort by date descending (latest first)
    return list.slice().sort((a, b) => {
      const dateCompare = (b.date || "").localeCompare(a.date || "");
      if (dateCompare !== 0) return dateCompare;
      return (b.startTime || "").localeCompare(a.startTime || "");
    }).slice(0, 5);
  }, [allEvents, user]);

  useEffect(() => {
    if (!user?._id) return;
    accountApi.getAll()
      .then(accounts => {
        const found = accounts.find(a => a._id === user._id);
        if (found) {
          setProfile(found);
          setEditForm({
            name: found.name ?? "",
            email: found.email ?? "",
            password: ""
          });
        }
      })
      .catch((err) => toast.error("Failed to load user profile: " + err.message))
      .finally(() => setLoadingProfile(false));
  }, [user?._id]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!editForm.email.trim()) {
      toast.error("Email is required.");
      return;
    }
    
    try {
      const updateData = {
        name: editForm.name,
        email: editForm.email,
      };
      
      if (editForm.password.trim()) {
        updateData.passwordHash = await hashPassword(editForm.password);
      }
      
      const updated = await accountApi.update(user._id, updateData);
      setProfile(updated);
      setIsEditing(false);
      toast.success("Profile updated successfully!");
      
      // Update session in localStorage
      const currentSession = JSON.parse(localStorage.getItem("cijs_current_user") || "{}");
      localStorage.setItem("cijs_current_user", JSON.stringify({
        ...currentSession,
        name: updated.name,
        email: updated.email
      }));
      
      // Refresh to update header/sidebar immediately
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err) {
      toast.error(err.message || "Failed to update profile.");
    }
  };

  if (loadingProfile) {
    return <div className="stateBox"><div className="spinner" /></div>;
  }

  const initial = profile?.name ? profile.name[0].toUpperCase() : "?";

  return (
    <div className="userPage">
      <div className="pageHeader">
        <h1 className="pageTitle">User Settings & Dashboard</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '24px' }}>
        {/* Profile Card / Edit Form */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 24px' }}>
          {!isEditing ? (
            <>
              <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', fontWeight: 'bold', marginBottom: '16px' }}>
                {initial}
              </div>
              <h2 style={{ fontSize: '22px', color: 'var(--color-dark)', marginBottom: '4px', textAlign: 'center' }}>{profile?.name || "User"}</h2>
              <p style={{ color: 'var(--color-muted)', marginBottom: '24px', textTransform: 'capitalize', fontWeight: '600' }}>{profile?.role || "Member"}</p>
              
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'left' }}>
                <div style={{ padding: '12px', background: 'var(--color-surface)', borderRadius: '12px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--color-muted)' }}>Email</span>
                  <p style={{ fontSize: '14px', fontWeight: '500', color: 'var(--color-dark)' }}>{profile?.email || "—"}</p>
                </div>
                <div style={{ padding: '12px', background: 'var(--color-surface)', borderRadius: '12px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--color-muted)' }}>Profile ID</span>
                  <p style={{ fontSize: '12px', fontWeight: '500', color: 'var(--color-dark)', fontFamily: 'monospace' }}>
                    {profile?.linkedProfileId
                      ? `#${String(profile.linkedProfileId).slice(-8).toUpperCase()}`
                      : "—"}
                  </p>
                </div>
                <div style={{ padding: '12px', background: 'var(--color-surface)', borderRadius: '12px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--color-muted)' }}>Account Status</span>
                  <p style={{ fontSize: '14px', fontWeight: '500', color: 'var(--color-dark)', textTransform: 'capitalize' }}>{profile?.status || "Active"}</p>
                </div>
              </div>
              
              <Button variant="primary" style={{ width: '100%', marginTop: '24px' }} onClick={() => setIsEditing(true)}>Edit Profile</Button>
            </>
          ) : (
            <form onSubmit={handleSaveProfile} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ fontSize: '18px', color: 'var(--color-dark)', fontWeight: 700, alignSelf: 'flex-start', marginBottom: '8px' }}>Edit Profile</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-dark)' }}>Name</label>
                <input 
                  type="text" 
                  value={editForm.name} 
                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e0e0e0', borderRadius: '8px', fontSize: '14px' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-dark)' }}>Email *</label>
                <input 
                  type="email" 
                  required
                  value={editForm.email} 
                  onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                  style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e0e0e0', borderRadius: '8px', fontSize: '14px' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-dark)' }}>New Password</label>
                <input 
                  type="password" 
                  placeholder="Leave blank to keep current password"
                  value={editForm.password} 
                  onChange={(e) => setEditForm(prev => ({ ...prev, password: e.target.value }))}
                  style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e0e0e0', borderRadius: '8px', fontSize: '14px' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <Button type="button" variant="outline" style={{ flex: 1 }} onClick={() => setIsEditing(false)}>Cancel</Button>
                <Button type="submit" variant="primary" style={{ flex: 1 }}>Save</Button>
              </div>
            </form>
          )}
        </div>

        {/* Recent Classes Timeline */}
        <div className="card">
          <h2 className="cardTitle" style={{ marginBottom: '24px' }}>Latest Classes</h2>
          {loadingEvents ? (
            <div className="spinner" style={{ margin: 'auto' }} />
          ) : (
            <div className="timeline" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {recentClasses.length > 0 ? (
                recentClasses.map(cls => {
                  const teacherName = getTeacherName(cls.teacherId, teacherList);
                  return (
                    <div key={cls._id} style={{ display: 'flex', gap: '16px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ 
                          width: '14px', 
                          height: '14px', 
                          borderRadius: '50%', 
                          backgroundColor: cls.color || '#4D44B5', 
                          border: '2px solid white', 
                          boxShadow: '0 0 0 2px #f0f0f0', 
                          zIndex: 2 
                        }} />
                        <div style={{ width: '2px', flex: 1, backgroundColor: '#f0f0f0', margin: '4px 0 -24px' }} />
                      </div>
                      <div>
                        <h4 style={{ fontSize: '15px', color: '#303972', fontWeight: 600, margin: 0 }}>
                          {cls.title}
                        </h4>
                        <p style={{ fontSize: '13px', color: '#A098AE', margin: '4px 0' }}>
                          {cls.className && `Class: ${cls.className} · `}
                          Time: {cls.startTime} - {cls.endTime}
                          {user?.role === "student" && teacherName && ` · Teacher: ${teacherName}`}
                        </p>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                          <span style={{ fontSize: '11px', color: 'var(--color-primary)', background: '#ede9ff', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>
                            {cls.date}
                          </span>
                          {user?.role === "student" && user?.linkedProfileId && (() => {
                            const isAbsent = Array.isArray(cls.absentees) && cls.absentees.includes(user.linkedProfileId);
                            return (
                              <span style={{
                                background: isAbsent ? "#ffebee" : "#e8f5e9",
                                color: isAbsent ? "#c62828" : "#2e7d32",
                                padding: "2px 8px",
                                borderRadius: "12px",
                                fontSize: "11px",
                                fontWeight: "700"
                              }}>
                                {isAbsent ? "ABSENT" : "PRESENT"}
                              </span>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p style={{ color: 'var(--color-muted)', fontSize: '14px' }}>No classes scheduled.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
