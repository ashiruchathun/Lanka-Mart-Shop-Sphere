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

async function getProductById(req, res) {
  const productId = Number(req.params.id);

  if (!Number.isInteger(productId) || productId <= 0) {
    return res.status(400).json({
      success: false,
      message: "A valid product ID is required",
    });
  }

  try {
    const [products] = await db.query(
      `
        SELECT *
        FROM product_catalogue_view
        WHERE product_id = ?
      `,
      [productId]
    );

    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      data: products[0],
    });
  } catch (error) {
    console.error("Get product error:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to retrieve the product",
    });
  }
}

module.exports = {
  getAllProducts,
  getProductById,
};