import { useEffect, useMemo, useState } from "react";
import { getProducts } from "./services/productService";
import "./App.css";

const BACKEND_URL = "http://localhost:5000";

const categoryIcons = {
  Electronics: "🎧",
  Fashion: "👕",
  "Home and Kitchen": "🏠",
  "Beauty and Personal Care": "✨",
  "Sports and Fitness": "🏋️",
  Books: "📚",
};

function formatPrice(price) {
  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    minimumFractionDigits: 2,
  }).format(Number(price));
}

function App() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStock, setSelectedStock] = useState("All");
  const [sortOption, setSortOption] = useState("newest");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadProducts() {
    try {
      setLoading(true);
      setError("");

      const productData = await getProducts();
      setProducts(productData);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  const categories = useMemo(() => {
    return [
      "All",
      ...new Set(products.map((product) => product.category_name)),
    ];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    const result = products.filter((product) => {
      const matchesSearch =
        product.product_name.toLowerCase().includes(normalizedSearch) ||
        product.sku.toLowerCase().includes(normalizedSearch) ||
        product.category_name.toLowerCase().includes(normalizedSearch) ||
        product.description.toLowerCase().includes(normalizedSearch);

      const matchesCategory =
        selectedCategory === "All" ||
        product.category_name === selectedCategory;

      const matchesStock =
        selectedStock === "All" ||
        product.stock_status === selectedStock;

      return matchesSearch && matchesCategory && matchesStock;
    });

    return result.sort((firstProduct, secondProduct) => {
      if (sortOption === "price-low") {
        return Number(firstProduct.price) - Number(secondProduct.price);
      }

      if (sortOption === "price-high") {
        return Number(secondProduct.price) - Number(firstProduct.price);
      }

      if (sortOption === "name") {
        return firstProduct.product_name.localeCompare(
          secondProduct.product_name
        );
      }

      if (sortOption === "stock") {
        return (
          Number(secondProduct.quantity_in_stock) -
          Number(firstProduct.quantity_in_stock)
        );
      }

      return Number(secondProduct.product_id) - Number(firstProduct.product_id);
    });
  }, [
    products,
    searchTerm,
    selectedCategory,
    selectedStock,
    sortOption,
  ]);

  const statistics = useMemo(() => {
    return {
      total: products.length,
      active: products.filter((product) => product.is_active === 1).length,
      lowStock: products.filter(
        (product) => product.stock_status === "Low Stock"
      ).length,
      outOfStock: products.filter(
        (product) => product.stock_status === "Out of Stock"
      ).length,
    };
  }, [products]);

  function getStockClass(stockStatus) {
    if (stockStatus === "In Stock") {
      return "stock-badge in-stock";
    }

    if (stockStatus === "Low Stock") {
      return "stock-badge low-stock";
    }

    return "stock-badge out-of-stock";
  }

  function clearFilters() {
    setSearchTerm("");
    setSelectedCategory("All");
    setSelectedStock("All");
    setSortOption("newest");
  }

  return (
    <div className="app">
      <header className="site-header">
        <a className="brand" href="/">
          <span className="brand-icon">S</span>

          <span>
            <strong>ShopSphere</strong>
            <small>Lanka Mart</small>
          </span>
        </a>

        <nav className="navigation" aria-label="Main navigation">
          <a className="active" href="#catalogue">
            Products
          </a>
          <a href="#categories">Categories</a>
          <a href="#inventory">Inventory</a>
        </nav>

        <button className="admin-button" type="button">
          Admin Portal
        </button>
      </header>

      <main>
        <section className="hero-section">
          <div className="hero-content">
            <span className="eyebrow">Lanka Mart Product Catalogue</span>

            <h1>
              Discover products made for
              <span> everyday living.</span>
            </h1>

            <p>
              Browse our latest products, compare prices and check stock
              availability in real time.
            </p>

            <a className="browse-button" href="#catalogue">
              Browse catalogue
            </a>
          </div>

          <div className="hero-decoration">
            <div className="floating-card card-one">
              <span>✓</span>
              Live inventory
            </div>

            <div className="hero-circle">
              <span>🛍️</span>
            </div>

            <div className="floating-card card-two">
              <strong>{statistics.total}</strong>
              Products available
            </div>
          </div>
        </section>

        <section className="statistics-section" aria-label="Product statistics">
          <article>
            <span className="stat-icon blue">▦</span>
            <div>
              <strong>{statistics.total}</strong>
              <p>Total products</p>
            </div>
          </article>

          <article>
            <span className="stat-icon green">✓</span>
            <div>
              <strong>{statistics.active}</strong>
              <p>Active products</p>
            </div>
          </article>

          <article>
            <span className="stat-icon orange">!</span>
            <div>
              <strong>{statistics.lowStock}</strong>
              <p>Low-stock products</p>
            </div>
          </article>

          <article>
            <span className="stat-icon red">×</span>
            <div>
              <strong>{statistics.outOfStock}</strong>
              <p>Out-of-stock products</p>
            </div>
          </article>
        </section>

        <section className="catalogue-section" id="catalogue">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Our collection</span>
              <h2>Product catalogue</h2>
            </div>

            <p>
              Showing <strong>{filteredProducts.length}</strong> of{" "}
              <strong>{products.length}</strong> products
            </p>
          </div>

          <div className="filter-panel">
            <label className="search-control">
              <span>⌕</span>

              <input
                type="search"
                placeholder="Search products, categories or SKU..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </label>

            <select
              value={selectedCategory}
              onChange={(event) => setSelectedCategory(event.target.value)}
              aria-label="Filter products by category"
            >
              {categories.map((category) => (
                <option value={category} key={category}>
                  {category === "All" ? "All categories" : category}
                </option>
              ))}
            </select>

            <select
              value={selectedStock}
              onChange={(event) => setSelectedStock(event.target.value)}
              aria-label="Filter products by stock status"
            >
              <option value="All">All stock levels</option>
              <option value="In Stock">In Stock</option>
              <option value="Low Stock">Low Stock</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>

            <select
              value={sortOption}
              onChange={(event) => setSortOption(event.target.value)}
              aria-label="Sort products"
            >
              <option value="newest">Newest first</option>
              <option value="name">Name: A–Z</option>
              <option value="price-low">Price: Low to high</option>
              <option value="price-high">Price: High to low</option>
              <option value="stock">Highest stock</option>
            </select>
          </div>

          {loading && (
            <div className="status-message">
              <span className="loader"></span>
              <h3>Loading products</h3>
              <p>Please wait while the catalogue is retrieved.</p>
            </div>
          )}

          {!loading && error && (
            <div className="status-message error-message">
              <span>!</span>
              <h3>Catalogue unavailable</h3>
              <p>{error}</p>

              <button type="button" onClick={loadProducts}>
                Try again
              </button>
            </div>
          )}

          {!loading && !error && filteredProducts.length === 0 && (
            <div className="status-message">
              <span>⌕</span>
              <h3>No products found</h3>
              <p>Try changing your search or selected filters.</p>

              <button type="button" onClick={clearFilters}>
                Clear filters
              </button>
            </div>
          )}

          {!loading && !error && filteredProducts.length > 0 && (
            <div className="product-grid">
              {filteredProducts.map((product) => (
                <article className="product-card" key={product.product_id}>
                  <div className="product-image">
                    <span className="category-symbol">
                      {categoryIcons[product.category_name] || "📦"}
                    </span>

                    {product.image_url && (
                      <img
                        src={`${BACKEND_URL}${product.image_url}`}
                        alt={product.product_name}
                        onError={(event) => {
                          event.currentTarget.style.display = "none";
                        }}
                      />
                    )}

                    <span className={getStockClass(product.stock_status)}>
                      {product.stock_status}
                    </span>
                  </div>

                  <div className="product-information">
                    <p className="product-category">
                      {product.category_name}
                    </p>

                    <h3>{product.product_name}</h3>

                    <p className="product-description">
                      {product.description}
                    </p>

                    <div className="product-meta">
                      <span>SKU: {product.sku}</span>
                      <span>{product.quantity_in_stock} available</span>
                    </div>

                    <div className="product-footer">
                      <div>
                        <small>Price</small>
                        <strong>{formatPrice(product.price)}</strong>
                      </div>

                      <button
                        type="button"
                        disabled={product.stock_status === "Out of Stock"}
                      >
                        {product.stock_status === "Out of Stock"
                          ? "Unavailable"
                          : "View product"}
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      <footer>
        <div>
          <strong>ShopSphere</strong>
          <p>Product and Catalogue Management System</p>
        </div>

        <p>© 2026 Lanka Mart. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;