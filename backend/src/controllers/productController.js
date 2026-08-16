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

async function createProduct(req, res) {
  const {
    category_id,
    product_name,
    sku,
    description = null,
    price,
    quantity_in_stock = 0,
    reorder_level = 5,
    image_url = null,
    alt_text = null,
  } = req.body;

  const categoryId = Number(category_id);
  const productPrice = Number(price);
  const quantity = Number(quantity_in_stock);
  const reorderLevel = Number(reorder_level);

  const invalidInput =
    !Number.isInteger(categoryId) ||
    categoryId <= 0 ||
    typeof product_name !== "string" ||
    product_name.trim() === "" ||
    typeof sku !== "string" ||
    sku.trim() === "" ||
    !Number.isFinite(productPrice) ||
    productPrice < 0 ||
    !Number.isInteger(quantity) ||
    quantity < 0 ||
    !Number.isInteger(reorderLevel) ||
    reorderLevel < 0;

  if (invalidInput) {
    return res.status(400).json({
      success: false,
      message: "Please provide valid product information",
    });
  }

  let connection;

  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    const [categories] = await connection.query(
      "SELECT category_id FROM categories WHERE category_id = ?",
      [categoryId]
    );

    if (categories.length === 0) {
      await connection.rollback();

      return res.status(400).json({
        success: false,
        message: "The selected category does not exist",
      });
    }

    const cleanDescription =
      typeof description === "string" && description.trim() !== ""
        ? description.trim()
        : null;

    const [productResult] = await connection.query(
      `
        INSERT INTO products
          (category_id, product_name, sku, description, price)
        VALUES (?, ?, ?, ?, ?)
      `,
      [
        categoryId,
        product_name.trim(),
        sku.trim(),
        cleanDescription,
        productPrice,
      ]
    );

    const productId = productResult.insertId;

    await connection.query(
      `
        INSERT INTO inventory
          (product_id, quantity_in_stock, reorder_level, last_restocked_at)
        VALUES (?, ?, ?, CURRENT_TIMESTAMP)
      `,
      [productId, quantity, reorderLevel]
    );

    if (typeof image_url === "string" && image_url.trim() !== "") {
      const cleanAltText =
        typeof alt_text === "string" && alt_text.trim() !== ""
          ? alt_text.trim()
          : product_name.trim();

      await connection.query(
        `
          INSERT INTO product_images
            (product_id, image_url, alt_text, is_primary)
          VALUES (?, ?, ?, TRUE)
        `,
        [productId, image_url.trim(), cleanAltText]
      );
    }

    await connection.commit();

    const [products] = await connection.query(
      `
        SELECT *
        FROM product_catalogue_view
        WHERE product_id = ?
      `,
      [productId]
    );

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: products[0],
    });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message: "A product with this SKU already exists",
      });
    }

    console.error("Create product error:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to create the product",
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
}
async function updateProduct(req, res) {
  const productId = Number(req.params.id);

  if (!Number.isInteger(productId) || productId <= 0) {
    return res.status(400).json({
      success: false,
      message: "A valid product ID is required",
    });
  }

  const {
    category_id,
    product_name,
    sku,
    description = null,
    price,
    is_active = 1,
    quantity_in_stock,
    reorder_level,
    image_url = null,
    alt_text = null,
  } = req.body;

  const categoryId = Number(category_id);
  const productPrice = Number(price);
  const activeStatus = Number(is_active);
  const quantity = Number(quantity_in_stock);
  const reorderLevel = Number(reorder_level);

  const invalidInput =
    !Number.isInteger(categoryId) ||
    categoryId <= 0 ||
    typeof product_name !== "string" ||
    product_name.trim() === "" ||
    typeof sku !== "string" ||
    sku.trim() === "" ||
    !Number.isFinite(productPrice) ||
    productPrice < 0 ||
    ![0, 1].includes(activeStatus) ||
    !Number.isInteger(quantity) ||
    quantity < 0 ||
    !Number.isInteger(reorderLevel) ||
    reorderLevel < 0;

  if (invalidInput) {
    return res.status(400).json({
      success: false,
      message: "Please provide valid product information",
    });
  }

  let connection;

  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    const [existingProducts] = await connection.query(
      `
        SELECT
          p.product_id,
          COALESCE(i.quantity_in_stock, 0) AS old_quantity
        FROM products p
        LEFT JOIN inventory i
          ON p.product_id = i.product_id
        WHERE p.product_id = ?
      `,
      [productId]
    );

    if (existingProducts.length === 0) {
      await connection.rollback();

      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const [categories] = await connection.query(
      "SELECT category_id FROM categories WHERE category_id = ?",
      [categoryId]
    );

    if (categories.length === 0) {
      await connection.rollback();

      return res.status(400).json({
        success: false,
        message: "The selected category does not exist",
      });
    }

    const cleanDescription =
      typeof description === "string" && description.trim() !== ""
        ? description.trim()
        : null;

    await connection.query(
      `
        UPDATE products
        SET
          category_id = ?,
          product_name = ?,
          sku = ?,
          description = ?,
          price = ?,
          is_active = ?
        WHERE product_id = ?
      `,
      [
        categoryId,
        product_name.trim(),
        sku.trim(),
        cleanDescription,
        productPrice,
        activeStatus,
        productId,
      ]
    );

    const oldQuantity = Number(existingProducts[0].old_quantity);
    const quantityChange = quantity - oldQuantity;

    const [inventoryResult] = await connection.query(
      `
        UPDATE inventory
        SET
          quantity_in_stock = ?,
          reorder_level = ?,
          last_restocked_at =
            CASE
              WHEN ? > 0 THEN CURRENT_TIMESTAMP
              ELSE last_restocked_at
            END
        WHERE product_id = ?
      `,
      [quantity, reorderLevel, quantityChange, productId]
    );

    if (inventoryResult.affectedRows === 0) {
      await connection.query(
        `
          INSERT INTO inventory
            (
              product_id,
              quantity_in_stock,
              reorder_level,
              last_restocked_at
            )
          VALUES (?, ?, ?, CURRENT_TIMESTAMP)
        `,
        [productId, quantity, reorderLevel]
      );
    }

    if (quantityChange !== 0) {
      await connection.query(
        `
          INSERT INTO stock_movements
            (product_id, movement_type, quantity_change, note)
          VALUES (?, 'ADJUSTMENT', ?, ?)
        `,
        [
          productId,
          quantityChange,
          "Stock updated through Product Catalogue API",
        ]
      );
    }

    if (typeof image_url === "string" && image_url.trim() !== "") {
      const cleanAltText =
        typeof alt_text === "string" && alt_text.trim() !== ""
          ? alt_text.trim()
          : product_name.trim();

      const [imageResult] = await connection.query(
        `
          UPDATE product_images
          SET
            image_url = ?,
            alt_text = ?
          WHERE product_id = ?
            AND is_primary = TRUE
        `,
        [image_url.trim(), cleanAltText, productId]
      );

      if (imageResult.affectedRows === 0) {
        await connection.query(
          `
            INSERT INTO product_images
              (product_id, image_url, alt_text, is_primary)
            VALUES (?, ?, ?, TRUE)
          `,
          [productId, image_url.trim(), cleanAltText]
        );
      }
    }

    await connection.commit();

    const [products] = await connection.query(
      `
        SELECT *
        FROM product_catalogue_view
        WHERE product_id = ?
      `,
      [productId]
    );

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: products[0],
    });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message: "A product with this SKU already exists",
      });
    }

    console.error("Update product error:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to update the product",
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
}
module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
};