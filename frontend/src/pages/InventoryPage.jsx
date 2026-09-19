import { useEffect, useState, useMemo } from "react";
import { getProducts } from "../services/productService";

const BACKEND_URL = "http://localhost:5000";

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
    if (stockStatus === "In Stock") return "stock-badge in-stock";
    if (stockStatus === "Low Stock") return "stock-badge low-stock";
    return "stock-badge out-of-stock";
  }

  return (
    <section className="catalogue-section">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Real-time Stock</span>
          <h2>Inventory Management</h2>
        </div>
      </div>

      <div className="filter-panel">
        <label className="search-control">
          <span>⌕</span>
          <input
            type="search"
            placeholder="Search by product name or SKU..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </label>
      </div>

      {loading && (
        <div className="status-message">
          <span className="loader"></span>
          <h3>Loading inventory data</h3>
        </div>
      )}

      {!loading && error && (
        <div className="status-message error-message">
          <span>!</span>
          <h3>Inventory unavailable</h3>
          <p>{error}</p>
          <button type="button" onClick={loadInventory}>Try again</button>
        </div>
      )}

      {!loading && !error && filteredProducts.length > 0 && (
        <div style={{ overflowX: 'auto', marginTop: '2rem' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #eaeaea' }}>
                <th style={{ padding: '1rem' }}>SKU</th>
                <th style={{ padding: '1rem' }}>Product Name</th>
                <th style={{ padding: '1rem' }}>Category</th>
                <th style={{ padding: '1rem' }}>Stock Status</th>
                <th style={{ padding: '1rem' }}>Quantity in Stock</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.product_id} style={{ borderBottom: '1px solid #eaeaea' }}>
                  <td style={{ padding: '1rem', fontWeight: '500' }}>{product.sku}</td>
                  <td style={{ padding: '1rem' }}>{product.product_name}</td>
                  <td style={{ padding: '1rem' }}>{categoryIcons[product.category_name]} {product.category_name}</td>
                  <td style={{ padding: '1rem' }}>
                    <span className={getStockClass(product.stock_status)} style={{ position: 'static' }}>
                      {product.stock_status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', fontSize: '1.2rem', fontWeight: 'bold' }}>
                    {product.quantity_in_stock}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
