import useFetch from "../../hooks/useFetch";
import activityApi from "../../api/activityApi";
import Button from "../../components/common/Button";
import "./User.css";

const UserDashboard = () => {
  const { data: activities, loading } = useFetch(activityApi.getAll, []);

  return (
    <div className="userPage">
      <div className="pageHeader">
        <h1 className="pageTitle">User Settings & Dashboard</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '24px' }}>
        {/* Profile Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '32px 24px' }}>
          <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', fontWeight: 'bold', marginBottom: '16px' }}>
            N
          </div>
          <h2 style={{ fontSize: '22px', color: 'var(--color-dark)', marginBottom: '4px' }}>Nabila A.</h2>
          <p style={{ color: 'var(--color-muted)', marginBottom: '24px' }}>Admin / Principal</p>
          
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'left' }}>
            <div style={{ padding: '12px', background: 'var(--color-surface)', borderRadius: '12px' }}>
              <span style={{ fontSize: '12px', color: 'var(--color-muted)' }}>Email</span>
              <p style={{ fontSize: '14px', fontWeight: '500', color: 'var(--color-dark)' }}>nabila.admin@akademi.edu</p>
            </div>
            <div style={{ padding: '12px', background: 'var(--color-surface)', borderRadius: '12px' }}>
              <span style={{ fontSize: '12px', color: 'var(--color-muted)' }}>Phone</span>
              <p style={{ fontSize: '14px', fontWeight: '500', color: 'var(--color-dark)' }}>+12 345 6789 0</p>
            </div>
            <div style={{ padding: '12px', background: 'var(--color-surface)', borderRadius: '12px' }}>
              <span style={{ fontSize: '12px', color: 'var(--color-muted)' }}>Location</span>
              <p style={{ fontSize: '14px', fontWeight: '500', color: 'var(--color-dark)' }}>Jakarta, Indonesia</p>
            </div>
          </div>
          
          <Button variant="primary" style={{ width: '100%', marginTop: '24px' }}>Edit Profile</Button>
        </div>

        {/* Recent Activity Timeline */}
        <div className="card">
          <h2 className="cardTitle" style={{ marginBottom: '24px' }}>My Recent Activity</h2>
          {loading ? (
            <div className="spinner" style={{ margin: 'auto' }} />
          ) : (
            <div className="timeline" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {activities?.slice(0, 5).map(act => (
                <div key={act._id} style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: `var(--color-${act.dotColor || 'primary'})`, border: '2px solid white', boxShadow: '0 0 0 2px var(--color-surface)', zIndex: 2 }} />
                    <div style={{ width: '2px', flex: 1, backgroundColor: 'var(--color-surface)', margin: '4px 0 -24px' }} />
                  </div>
                  <div>
                    <p style={{ fontSize: '14px', color: 'var(--color-dark)', lineHeight: '1.4' }}>{act.description}</p>
                    <span style={{ fontSize: '12px', color: 'var(--color-muted)' }}>{new Date(act.timestamp).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
