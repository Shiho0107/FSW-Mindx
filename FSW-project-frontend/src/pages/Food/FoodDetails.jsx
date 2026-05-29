import { useParams } from "react-router-dom";
import useFetch from "../../hooks/useFetch";
import foodApi from "../../api/foodApi";
import Button from "../../components/common/Button";
import "./Food.css";

const FoodDetails = () => {
  const { id } = useParams();
  const { data: food, loading, error } = useFetch(() => foodApi.getById(id), [id]);

  if (loading) return <div className="stateBox"><div className="spinner" /></div>;
  if (error || !food) return <div className="stateBox errorMsg">Failed to load food details.</div>;

  return (
    <div className="foodDetailsPage">
      <div className="pageHeader">
        <h1 className="pageTitle">Food Details</h1>
      </div>

      <div className="card foodDetailsCard" style={{ display: 'flex', gap: '32px' }}>
        <div style={{ flex: 1 }}>
          <div className="foodImagePlaceholder" style={{ height: '300px', borderRadius: '16px', marginBottom: '24px' }}>
            {food.photo ? <img src={food.photo} alt={food.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '16px' }} /> : <span>🍽️</span>}
          </div>
        </div>
        
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <span className="foodCategory badge badge--active">{food.category}</span>
            <h2 style={{ fontSize: '28px', color: 'var(--color-dark)', marginTop: '12px' }}>{food.name}</h2>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginTop: '8px' }}>
              <span style={{ fontSize: '18px', fontWeight: 'bold' }}>⭐ {food.rating}</span>
              <span style={{ color: 'var(--color-muted)' }}>({food.totalReviews} reviews)</span>
            </div>
          </div>
          
          <p style={{ color: 'var(--color-muted)', lineHeight: '1.6' }}>{food.description}</p>
          
          <div>
            <h3 style={{ fontSize: '16px', color: 'var(--color-dark)', marginBottom: '8px' }}>Ingredients:</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {food.ingredients?.map((ing, idx) => (
                <span key={idx} style={{ padding: '6px 16px', background: 'var(--color-surface)', borderRadius: '20px', fontSize: '14px', color: 'var(--color-primary)' }}>
                  {ing}
                </span>
              ))}
            </div>
          </div>

          <div className="foodStatsRow" style={{ marginTop: 'auto', background: '#F8FAFC', padding: '16px', borderRadius: '12px' }}>
            <div className="foodStatCol">
              <span className="statValue">{food.totalOrders?.toLocaleString() || 0}</span>
              <span className="statLabel">Total Orders</span>
            </div>
            <div className="foodStatCol">
              <span className="statValue">{food.interestPercentage || 0}%</span>
              <span className="statLabel">Interest</span>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
            <Button variant="primary" style={{ flex: 1 }}>Edit Food</Button>
            <Button variant="outline" style={{ flex: 1 }}>Delete</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoodDetails;
