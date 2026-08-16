const db = require("../config/db");

async function getAllProducts(req, res) {
  try {
    const [products] = await db.query(`
      SELECT *
      FROM product_catalogue_view
      ORDER BY product_id DESC
    `);

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    console.error("Get products error:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to retrieve products",
    });
  }
}

module.exports = {
  getAllProducts,
};