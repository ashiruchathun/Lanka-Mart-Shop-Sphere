import { useEffect, useState, useMemo } from "react";
import { getProducts } from "../services/productService";
import { motion, AnimatePresence } from "motion/react";

const categoryIcons = {
  Electronics: "🎧",
  Fashion: "👕",
  "Home and Kitchen": "🏠",
  "Beauty and Personal Care": "✨",
  "Sports and Fitness": "🏋️",
  Books: "📚",
};

export default function InventoryPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  async function loadInventory() {
    try {
      setLoading(true);
      setError("");
      const productData = await getProducts();
      setProducts(productData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadInventory();
  }, []);

  const filteredProducts = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    return products.filter((product) => {
      return product.product_name.toLowerCase().includes(normalizedSearch) ||
             product.sku.toLowerCase().includes(normalizedSearch);
    });
  }, [products, searchTerm]);

  function getStockClass(stockStatus) {
    if (stockStatus === "In Stock") return "stock-badge in-stock transition-colors duration-300";
    if (stockStatus === "Low Stock") return "stock-badge low-stock transition-colors duration-300";
    return "stock-badge out-of-stock transition-colors duration-300";
  }

  const tableStagger = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const rowVariant = {
    hidden: { opacity: 0, x: -10 },
    show: { opacity: 1, x: 0, transition: { duration: 0.2 } }
  };

  return (
    <section className="catalogue-section">
      <motion.div 
        className="section-heading"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div>
          <span className="eyebrow">Real-time Stock</span>
          <h2>Inventory Management</h2>
        </div>
      </motion.div>

      <motion.div 
        layout 
        className="filter-panel inventory-search"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <label className="search-control">
          <span>⌕</span>
          <input
            type="search"
            aria-label="Search inventory by product name or SKU"
            placeholder="Search by product name or SKU..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="transition-colors duration-200 focus:ring-2 focus:ring-emerald-500"
          />
        </label>
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
            <h3>Loading inventory data</h3>
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
            <h3>Inventory unavailable</h3>
            <p>{error}</p>
            <motion.button 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }} 
              type="button" 
              onClick={loadInventory}
            >
              Try again
            </motion.button>
          </motion.div>
        )}

        {!loading && !error && filteredProducts.length > 0 && (
          <motion.div 
            key="table"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="inventory-table-wrap"
          >
            <table className="inventory-table">
              <thead>
                <tr>
                  <th scope="col">SKU</th>
                  <th scope="col">Product Name</th>
                  <th scope="col">Category</th>
                  <th scope="col">Stock Status</th>
                  <th scope="col">Quantity in Stock</th>
                </tr>
              </thead>
              <motion.tbody 
                variants={tableStagger} 
                initial="hidden" 
                animate="show"
              >
                <AnimatePresence>
                  {filteredProducts.map((product) => (
                    <motion.tr 
                      layout
                      variants={rowVariant}
                      initial="hidden"
                      animate="show"
                      exit={{ opacity: 0, scale: 0.95 }}
                      key={product.product_id}
                      className="hover:bg-slate-50 transition-colors duration-150"
                    >
                      <td className="font-mono text-sm">{product.sku}</td>
                      <td className="inventory-name">{product.product_name}</td>
                      <td>{categoryIcons[product.category_name] || "📦"} {product.category_name}</td>
                      <td>
                        <span className={`${getStockClass(product.stock_status)} inline-badge`}>
                          {product.stock_status}
                        </span>
                      </td>
                      <td className="inventory-number">
                        <motion.span 
                          key={product.quantity_in_stock}
                          initial={{ scale: 1.5, color: '#059669' }}
                          animate={{ scale: 1, color: 'inherit' }}
                          transition={{ duration: 0.5 }}
                        >
                          {product.quantity_in_stock}
                        </motion.span>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </motion.tbody>
            </table>
          </motion.div>
        )}

        {!loading && !error && filteredProducts.length === 0 && (
          <motion.div 
            key="empty"
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="status-message"
          >
            <h3>{searchTerm ? 'No matching products' : 'No inventory yet'}</h3>
            <p>{searchTerm ? 'Try a different product name or SKU.' : 'Products will appear here once they are added.'}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
