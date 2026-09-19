import { useEffect, useState, useMemo } from "react";
import { getProducts } from "../services/productService";

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

      <div className="filter-panel inventory-search">
        <label className="search-control">
          <span>⌕</span>
          <input
            type="search"
            aria-label="Search inventory by product name or SKU"
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
        <div className="inventory-table-wrap">
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
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.product_id}>
                  <td>{product.sku}</td>
                  <td className="inventory-name">{product.product_name}</td>
                  <td>{categoryIcons[product.category_name] || "📦"} {product.category_name}</td>
                  <td>
                    <span className={`${getStockClass(product.stock_status)} inline-badge`}>
                      {product.stock_status}
                    </span>
                  </td>
                  <td className="inventory-number">
                    {product.quantity_in_stock}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {!loading && !error && filteredProducts.length === 0 && (
        <div className="status-message"><h3>{searchTerm ? 'No matching products' : 'No inventory yet'}</h3><p>{searchTerm ? 'Try a different product name or SKU.' : 'Products will appear here once they are added.'}</p></div>
      )}
    </section>
  );
}
