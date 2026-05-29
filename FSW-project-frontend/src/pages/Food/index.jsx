import { useState } from "react";
import { toast } from "react-toastify";
import useFetch from "../../hooks/useFetch";
import foodApi from "../../api/foodApi";
import Button from "../../components/common/Button";
import FoodCard from "./components/FoodCard";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import "./Food.css";

const CATEGORIES = ["All Menu", "Breakfast", "Lunch", "Snack"];

const Food = () => {
  const [activeTab, setActiveTab] = useState("All Menu");
  const [localData, setLocalData] = useState([]);
  const handleFetchSuccess = (fetchedData) => setLocalData(fetchedData);
  const { data: foods, loading, error } = useFetch(foodApi.getAll, [], handleFetchSuccess);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this menu item?")) return;
    try {
      await foodApi.remove(id);
      setLocalData(prev => prev.filter(f => f._id !== id));
      toast.success("Food deleted successfully!");
    } catch (err) {
      toast.error("Failed to delete food: " + err.message);
    }
  };

  const currentData = localData.length ? localData : (foods || []);
  const filteredFoods = activeTab === "All Menu" 
    ? currentData 
    : currentData.filter(f => f.category === activeTab);

  if (loading && !localData.length) return <LoadingSpinner message="Loading menu…" />;
  if (error) return <LoadingSpinner message="Failed to load food menu." />;

  return (
    <div className="foodPage">
      <div className="pageHeader">
        <h1 className="pageTitle">Food</h1>
        <div className="headerActions">
          <Button variant="primary" leftIcon="➕">New Menu</Button>
        </div>
      </div>

      <div className="tabHeader">
        {CATEGORIES.map(tab => (
          <button 
            key={tab} 
            className={`tabBtn ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="foodGrid">
        {filteredFoods?.map((food) => (
          <FoodCard key={food._id} food={food} onDelete={handleDelete} />
        ))}
      </div>
    </div>
  );
};

export default Food;
