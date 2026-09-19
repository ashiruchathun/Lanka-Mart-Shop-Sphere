import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";

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

  const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <section className="catalogue-section">
      <motion.div 
        className="section-heading"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div>
          <span className="eyebrow">Browse by Collection</span>
          <h2>Product Categories</h2>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {loading && (
          <motion.div 
            key="loading"
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }} 
            exit={{ opacity: 0, scale: 0.9 }}
            className="status-message"
          >
            <span className="loader"></span>
            <h3>Loading categories</h3>
          </motion.div>
        )}

        {!loading && error && (
          <motion.div 
            key="error"
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="status-message error-message"
          >
            <span>!</span>
            <h3>Categories unavailable</h3>
            <p>{error}</p>
            <motion.button 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }} 
              type="button" 
              onClick={loadCategories}
            >
              Try again
            </motion.button>
          </motion.div>
        )}

        {!loading && !error && categories.length > 0 && (
          <motion.div 
            key="grid"
            className="product-grid"
            variants={staggerContainer}
            initial="hidden"
            animate="show"
          >
            {categories.map((category) => (
              <motion.div variants={fadeInUp} key={category.category_id}>
                <Link 
                  to={`/?category=${encodeURIComponent(category.category_name)}`}
                  className="product-card collection-card group block transition-shadow duration-300 focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-xl outline-none" 
                >
                  <motion.article whileHover={{ y: -5, scale: 1.02 }} transition={{ duration: 0.2 }}>
                    <div className="product-image transition-colors duration-300 group-hover:bg-emerald-50">
                      <motion.span 
                        className="category-symbol"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                      >
                        {categoryIcons[category.category_name] || "📦"}
                      </motion.span>
                    </div>
                    <div className="product-information">
                      <h3 className="group-hover:text-emerald-700 transition-colors duration-200">{category.category_name}</h3>
                      <p className="product-description">{category.description}</p>
                    </div>
                  </motion.article>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
        
        {!loading && !error && categories.length === 0 && (
          <motion.div 
            key="empty"
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }}
            className="status-message"
          >
            <h3>No categories yet</h3>
            <p>Collections will appear here as they are added.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
