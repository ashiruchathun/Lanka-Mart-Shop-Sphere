import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getProducts } from "../services/productService";
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from "motion/react";

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

function Counter({ from = 0, to }) {
  const count = useMotionValue(from);
  const rounded = useTransform(count, (latest) => Math.round(latest));
  const ref = useRef(null);
  
  useEffect(() => {
    const controls = animate(count, to, { duration: 1, ease: "easeOut" });
    return () => controls.stop();
  }, [count, to]);

  return <motion.strong ref={ref}>{rounded}</motion.strong>;
}

export default function CataloguePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStock, setSelectedStock] = useState("All");
  
  const selectedCategory = searchParams.get("category") || "All";
  
  const handleCategoryChange = (event) => {
    const value = event.target.value;
    if (value === "All") {
      searchParams.delete("category");
    } else {
      searchParams.set("category", value);
    }
    setSearchParams(searchParams);
  };
  const [sortOption, setSortOption] = useState("newest");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);

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
        product.description?.toLowerCase().includes(normalizedSearch);

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
      return "stock-badge in-stock transition-colors duration-300";
    }

    if (stockStatus === "Low Stock") {
      return "stock-badge low-stock transition-colors duration-300";
    }

    return "stock-badge out-of-stock transition-colors duration-300";
  }

  function clearFilters() {
    setSearchTerm("");
    setSearchParams({});
    setSelectedStock("All");
    setSortOption("newest");
  }

  // Animation variants
  const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <>
      <motion.section 
        className="hero-section"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
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
          <a className="browse-button transition-transform duration-200 hover:scale-105 active:scale-95" href="#catalogue">
            Browse catalogue
          </a>
        </div>

        <div className="hero-decoration">
          <motion.div 
            className="floating-card card-one"
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          >
            <span>✓</span>
            Live inventory
          </motion.div>

          <motion.div 
            className="hero-circle"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
          >
            <span>🛍️</span>
          </motion.div>

          <motion.div 
            className="floating-card card-two"
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
          >
            {!loading && <Counter to={statistics.total} />}
            Products available
          </motion.div>
        </div>
      </motion.section>

      <motion.section 
        className="statistics-section" 
        aria-label="Product statistics"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
        variants={staggerContainer}
      >
        <motion.article variants={fadeInUp} className="transition-transform duration-200 hover:-translate-y-1 hover:shadow-md">
          <span className="stat-icon blue">▦</span>
          <div>
            {!loading ? <Counter to={statistics.total} /> : <strong>0</strong>}
            <p>Total products</p>
          </div>
        </motion.article>

        <motion.article variants={fadeInUp} className="transition-transform duration-200 hover:-translate-y-1 hover:shadow-md">
          <span className="stat-icon green">✓</span>
          <div>
            {!loading ? <Counter to={statistics.active} /> : <strong>0</strong>}
            <p>Active products</p>
          </div>
        </motion.article>

        <motion.article variants={fadeInUp} className="transition-transform duration-200 hover:-translate-y-1 hover:shadow-md">
          <span className="stat-icon orange">!</span>
          <div>
            {!loading ? <Counter to={statistics.lowStock} /> : <strong>0</strong>}
            <p>Low-stock products</p>
          </div>
        </motion.article>

        <motion.article variants={fadeInUp} className="transition-transform duration-200 hover:-translate-y-1 hover:shadow-md">
          <span className="stat-icon red">×</span>
          <div>
            {!loading ? <Counter to={statistics.outOfStock} /> : <strong>0</strong>}
            <p>Out-of-stock products</p>
          </div>
        </motion.article>
      </motion.section>

      <section className="catalogue-section" id="catalogue">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Our collection</span>
            <h2>Product catalogue</h2>
          </div>
          <p>
            Showing <strong>{!loading ? filteredProducts.length : 0}</strong> of{" "}
            <strong>{!loading ? products.length : 0}</strong> products
          </p>
        </div>

        <motion.div layout className="filter-panel">
          <label className="search-control">
            <span>⌕</span>
            <input
              aria-label="Search products"
              type="search"
              placeholder="Search products, categories or SKU..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="transition-colors duration-200 focus:ring-2 focus:ring-emerald-500"
            />
          </label>

          <select
            value={selectedCategory}
            onChange={handleCategoryChange}
            aria-label="Filter products by category"
            className="transition-colors duration-200 focus:ring-2 focus:ring-emerald-500"
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
            className="transition-colors duration-200 focus:ring-2 focus:ring-emerald-500"
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
            className="transition-colors duration-200 focus:ring-2 focus:ring-emerald-500"
          >
            <option value="newest">Newest first</option>
            <option value="name">Name: A–Z</option>
            <option value="price-low">Price: Low to high</option>
            <option value="price-high">Price: High to low</option>
            <option value="stock">Highest stock</option>
          </select>
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
              <h3>Loading products</h3>
              <p>Please wait while the catalogue is retrieved.</p>
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
              <h3>Catalogue unavailable</h3>
              <p>{error}</p>
              <motion.button 
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }} 
                type="button" 
                onClick={loadProducts}
              >
                Try again
              </motion.button>
            </motion.div>
          )}

          {!loading && !error && filteredProducts.length === 0 && (
            <motion.div 
              key="empty"
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="status-message"
            >
              <span>⌕</span>
              <h3>No products found</h3>
              <p>Try changing your search or selected filters.</p>
              <motion.button 
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }} 
                type="button" 
                onClick={clearFilters}
              >
                Clear filters
              </motion.button>
            </motion.div>
          )}

          {!loading && !error && filteredProducts.length > 0 && (
            <motion.div 
              key="grid"
              className="product-grid"
              variants={staggerContainer}
              initial="hidden"
              animate="show"
            >
              <AnimatePresence>
                {filteredProducts.map((product) => (
                  <motion.article 
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    whileHover={{ y: -5, scale: 1.01 }}
                    transition={{ duration: 0.2 }}
                    className="product-card overflow-hidden" 
                    key={product.product_id}
                  >
                    <div className="product-image overflow-hidden">
                      <span className="category-symbol">
                        {categoryIcons[product.category_name] || "📦"}
                      </span>
                      {product.image_url && (
                        <motion.img
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.3 }}
                          src={/^https?:\/\//i.test(product.image_url) ? product.image_url : `${BACKEND_URL}${product.image_url}`}
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
                        <motion.button
                          whileHover={{ scale: product.stock_status === "Out of Stock" ? 1 : 1.05 }}
                          whileTap={{ scale: product.stock_status === "Out of Stock" ? 1 : 0.95 }}
                          type="button"
                          disabled={product.stock_status === "Out of Stock"}
                          onClick={() => setSelectedProduct(product)}
                        >
                          {product.stock_status === "Out of Stock"
                            ? "Unavailable"
                            : "View details"}
                        </motion.button>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      <AnimatePresence>
        {selectedProduct && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setSelectedProduct(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative overflow-hidden"
              onClick={e => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="product-dialog-title"
            >
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Product details</span>
                <button 
                  type="button" 
                  className="text-slate-400 hover:text-slate-600 transition-colors bg-slate-100 rounded-full w-8 h-8 flex items-center justify-center focus:ring-2 focus:ring-emerald-500" 
                  onClick={() => setSelectedProduct(null)} 
                  aria-label="Close product details"
                >
                  ✕
                </button>
              </div>
              <h2 id="product-dialog-title" className="text-2xl font-bold text-slate-900 mb-1">{selectedProduct.product_name}</h2>
              <p className="text-sm font-medium text-slate-500 mb-4">{selectedProduct.category_name}</p>
              
              {selectedProduct.image_url && (
                <div className="w-full h-48 bg-slate-50 rounded-lg mb-4 overflow-hidden flex items-center justify-center">
                  <img
                    src={/^https?:\/\//i.test(selectedProduct.image_url) ? selectedProduct.image_url : `${BACKEND_URL}${selectedProduct.image_url}`}
                    alt={selectedProduct.product_name}
                    className="max-h-full object-contain"
                  />
                </div>
              )}
              
              <p className="text-slate-700 leading-relaxed mb-6">{selectedProduct.description || 'No description available.'}</p>
              
              <div className="flex flex-col gap-2 mb-6 p-4 bg-slate-50 rounded-xl">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">SKU</span>
                  <span className="font-mono font-medium text-slate-700">{selectedProduct.sku}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Availability</span>
                  <span className={`font-medium ${selectedProduct.stock_status === 'Out of Stock' ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {selectedProduct.stock_status} ({selectedProduct.quantity_in_stock})
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                <span className="text-sm text-slate-500">Price</span>
                <strong className="text-2xl font-bold text-slate-900">{formatPrice(selectedProduct.price)}</strong>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
