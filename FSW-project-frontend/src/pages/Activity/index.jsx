import useFetch from "../../hooks/useFetch";
import activityApi from "../../api/activityApi";
import "./Activity.css";

const Activity = () => {
  const { data: activities, loading, error } = useFetch(activityApi.getAll, []);

  if (loading) return <div className="stateBox"><div className="spinner" /></div>;
  if (error) return <div className="stateBox errorMsg">Failed to load activity.</div>;

  return (
    <div className="activityPage">
      <div className="pageHeader">
        <h1 className="pageTitle">Notification & Latest Activity</h1>
      </div>

      <div className="card timelineCard">
        <div className="timeline">
          {activities?.map((item) => {
            // Colors from the mock plan: purple, red, yellow, blue, green, orange
            return (
              <div key={item._id} className="timelineItem" style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', marginBottom: '24px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: `var(--color-${item.dotColor || 'primary'})`, zIndex: 2, border: '3px solid white', boxShadow: '0 0 0 2px var(--color-surface)' }} />
                  <div style={{ width: '2px', height: '100%', backgroundColor: 'var(--color-surface)', position: 'absolute', top: '16px', bottom: '-24px', zIndex: 1 }} />
                </div>
                
                <div className="timelineContent" style={{ flex: 1, position: 'relative', top: '-4px' }}>
                  <p className="timelineDesc" style={{ fontSize: '16px', color: 'var(--color-dark)', margin: 0 }}>
                    <strong>{item.actorName || "User"}</strong> {item.description?.replace(item.actorName, "")}
                  </p>
                  <span className="timelineTime" style={{ fontSize: '14px', color: 'var(--color-muted)', marginTop: '8px', display: 'block' }}>
                    {new Date(item.timestamp).toLocaleString("en-US", { month: "long", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit"})}
                  </span>
                </div>
              </div>
            );
          })}

          {!activities?.length && <p style={{color: "#A098AE", padding: 24}}>No recent activity.</p>}
        </div>
      </div>
    </div>
  );
};

export default Activity;
