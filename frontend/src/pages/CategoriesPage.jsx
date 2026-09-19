import { useEffect, useState } from "react";

const BACKEND_URL = "http://localhost:5000";

const categoryIcons = {
  Electronics: "🎧",
  Fashion: "👕",
  "Home and Kitchen": "🏠",
  "Beauty and Personal Care": "✨",
  "Sports and Fitness": "🏋️",
  Books: "📚",
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadCategories() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${BACKEND_URL}/api/categories`);
      if (!response.ok) {
        throw new Error("Unable to retrieve categories from the server.");
      }
      
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || "Unable to retrieve categories.");
      }

      setCategories(result.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  return (
    <section className="catalogue-section">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Browse by Collection</span>
          <h2>Product Categories</h2>
        </div>
      </div>

      {loading && (
        <div className="status-message">
          <span className="loader"></span>
          <h3>Loading categories</h3>
        </div>
      )}

      {!loading && error && (
        <div className="status-message error-message">
          <span>!</span>
          <h3>Categories unavailable</h3>
          <p>{error}</p>
          <button type="button" onClick={loadCategories}>Try again</button>
        </div>
      )}

      {!loading && !error && categories.length > 0 && (
        <div className="product-grid">
          {categories.map((category) => (
            <article className="product-card" key={category.category_id}>
              <div className="product-image" style={{ minHeight: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="category-symbol" style={{ fontSize: '4rem', opacity: 1, position: 'static' }}>
                  {categoryIcons[category.category_name] || "📦"}
                </span>
              </div>
              <div className="product-information">
                <h3>{category.category_name}</h3>
                <p className="product-description">{category.description}</p>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
