const db = require("../config/db");

async function getAllCategories(req, res) {
  try {
    const [categories] = await db.query(`
      SELECT *
      FROM categories
      ORDER BY category_name ASC
    `);

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    console.error("Get categories error:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to retrieve categories",
    });
  }
}

module.exports = {
  getAllCategories,
};
