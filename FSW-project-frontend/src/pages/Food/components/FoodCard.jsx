const FoodCard = ({ food, onDelete }) => (
  <div className="foodCard" style={{ position: 'relative' }}>
    {onDelete && (
      <button
        onClick={() => onDelete(food._id)}
        style={{ position: 'absolute', top: 12, right: 12, background: 'white', border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', color: 'var(--color-danger)', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', zIndex: 10 }}
        title="Delete Food"
      >
        🗑️
      </button>
    )}
    <div className="foodImagePlaceholder">
      {food.photo ? <img src={food.photo} alt={food.name} /> : <span>🍽️</span>}
    </div>

    <div className="foodContent">
      <div className="foodHeaderRow">
        <span className="foodCategory badge badge--active">{food.category}</span>
        <span className="foodRating">⭐ {food.rating}</span>
      </div>

      <h3 className="foodTitle" title={food.name}>{food.name}</h3>

      <div className="foodStatsRow">
        <div className="foodStatCol">
          <span className="statValue">{food.totalOrders?.toLocaleString() || 0}</span>
          <span className="statLabel">Total Order</span>
        </div>
        <div className="foodStatCol">
          <span className="statValue">{food.interestPercentage || 0}%</span>
          <span className="statLabel">Interest</span>
        </div>
      </div>

      <div className="foodProgress">
        <div className="progressTrack">
          <div className="progressFill" style={{ width: `${food.interestPercentage || 50}%` }} />
        </div>
      </div>
    </div>
  </div>
);

export default FoodCard;
