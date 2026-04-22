const CategoryDAO = require("../models/CategoryDAO");
const express = require("express");
const router = express.Router();

// utils
const JwtUtil = require("../utils/JwtUtil");
const EmailUtil = require("../utils/EmailUtil");

// daos
const AdminDAO = require("../models/AdminDAO");
const ProductDAO = require("../models/ProductDAO");
const OrderDAO = require("../models/OrderDAO");
const CustomerDAO = require("../models/CustomerDAO");

// ===== UTILITIES =====
const sendResponse = (res, statusCode, success, message, data = null) => {
  res.status(statusCode).json({
    success,
    message,
    ...(data && { data })
  });
};

const validateInput = (fields) => {
  for (const [key, value] of Object.entries(fields)) {
    if (!value) return `${key} is required`;
  }
  return null;
};

// ===== LOGIN & AUTH =====
router.post("/login", async (req, res) => {
  try {
    const error = validateInput({
      username: req.body.username,
      password: req.body.password
    });

    if (error) {
      return sendResponse(res, 400, false, error);
    }

    const { username, password } = req.body;
    const admin = await AdminDAO.selectByUsernameAndPassword(username, password);

    if (!admin) {
      return sendResponse(res, 401, false, "Incorrect username or password");
    }

    const token = JwtUtil.genToken(admin.username, admin.password);
    sendResponse(res, 200, true, "Authentication successful", { token });
  } catch (error) {
    console.error("Login error:", error);
    sendResponse(res, 500, false, "Server error");
  }
});

router.get("/token", JwtUtil.checkToken, (req, res) => {
  try {
    const token = req.headers["x-access-token"] || req.headers["authorization"];
    sendResponse(res, 200, true, "Token is valid", { token });
  } catch (error) {
    console.error("Token validation error:", error);
    sendResponse(res, 500, false, "Server error");
  }
});

// ===== CATEGORY ROUTES =====
router.get("/categories", JwtUtil.checkToken, async (req, res) => {
  try {
    const categories = await CategoryDAO.selectAll();
    sendResponse(res, 200, true, "Categories retrieved", categories);
  } catch (error) {
    console.error("Get categories error:", error);
    sendResponse(res, 500, false, "Failed to retrieve categories");
  }
});

router.post("/categories", JwtUtil.checkToken, async (req, res) => {
  try {
    const error = validateInput({ name: req.body.name });
    if (error) return sendResponse(res, 400, false, error);

    const category = { name: req.body.name };
    const result = await CategoryDAO.insert(category);

    if (result.success) {
      sendResponse(res, 201, true, "Category created", result.data);
    } else {
      sendResponse(res, 400, false, result.message);
    }
  } catch (error) {
    console.error("Create category error:", error);
    sendResponse(res, 500, false, "Failed to create category");
  }
});

router.put("/categories/:id", JwtUtil.checkToken, async (req, res) => {
  try {
    const error = validateInput({
      id: req.params.id,
      name: req.body.name
    });
    if (error) return sendResponse(res, 400, false, error);

    const category = { _id: req.params.id, name: req.body.name };
    const result = await CategoryDAO.update(category);

    if (result.success) {
      sendResponse(res, 200, true, "Category updated", result.data);
    } else {
      sendResponse(res, 400, false, result.message);
    }
  } catch (error) {
    console.error("Update category error:", error);
    sendResponse(res, 500, false, "Failed to update category");
  }
});

router.delete("/categories/:id", JwtUtil.checkToken, async (req, res) => {
  try {
    const result = await CategoryDAO.delete(req.params.id);

    if (result.success) {
      sendResponse(res, 200, true, "Category deleted", result.data);
    } else {
      sendResponse(res, 400, false, result.message);
    }
  } catch (error) {
    console.error("Delete category error:", error);
    sendResponse(res, 500, false, "Failed to delete category");
  }
});

// ===== PRODUCT ROUTES =====
router.get("/products", JwtUtil.checkToken, async (req, res) => {
  try {
    const sizePage = 4;
    const curPage = Math.max(1, parseInt(req.query.page) || 1);
    const totalProducts = await ProductDAO.count();
    const noPages = Math.ceil(totalProducts / sizePage);

    if (curPage > noPages && noPages > 0) {
      return sendResponse(res, 400, false, "Page out of range");
    }

    const products = await ProductDAO.selectPage(curPage, sizePage);
    sendResponse(res, 200, true, "Products retrieved", {
      products,
      noPages,
      curPage
    });
  } catch (error) {
    console.error("Get products error:", error);
    sendResponse(res, 500, false, "Failed to retrieve products");
  }
});

router.post("/products", JwtUtil.checkToken, async (req, res) => {
  try {
    const error = validateInput({
      name: req.body.name,
      price: req.body.price,
      category: req.body.category,
      image: req.body.image
    });
    if (error) return sendResponse(res, 400, false, error);

    const { name, price, category: cid, image } = req.body;

    if (isNaN(price) || price <= 0) {
      return sendResponse(res, 400, false, "Price must be a positive number");
    }

    const category = await CategoryDAO.selectByID(cid);
    if (!category) {
      return sendResponse(res, 404, false, "Category not found");
    }

    const product = {
      name,
      price: Number(price),
      image,
      cdate: new Date().getTime(),
      category
    };

    const result = await ProductDAO.insert(product);

    if (result.success) {
      sendResponse(res, 201, true, "Product created", result.data);
    } else {
      sendResponse(res, 400, false, result.message);
    }
  } catch (error) {
    console.error("Create product error:", error);
    sendResponse(res, 500, false, "Failed to create product");
  }
});

router.put("/products/:id", JwtUtil.checkToken, async (req, res) => {
  try {
    const _id = req.params.id;
    const error = validateInput({
      id: _id,
      name: req.body.name,
      price: req.body.price,
      category: req.body.category
    });
    if (error) return sendResponse(res, 400, false, error);

    const { name, price, category: cid, image } = req.body;

    if (isNaN(price) || price <= 0) {
      return sendResponse(res, 400, false, "Price must be a positive number");
    }

    const category = await CategoryDAO.selectByID(cid);
    if (!category) {
      return sendResponse(res, 404, false, "Category not found");
    }

    const product = {
      _id,
      name,
      price: Number(price),
      image,
      cdate: new Date().getTime(),
      category
    };

    const result = await ProductDAO.update(product);

    if (result.success) {
      sendResponse(res, 200, true, "Product updated", result.data);
    } else {
      sendResponse(res, 400, false, result.message);
    }
  } catch (error) {
    console.error("Update product error:", error);
    sendResponse(res, 500, false, "Failed to update product");
  }
});

router.delete("/products/:id", JwtUtil.checkToken, async (req, res) => {
  try {
    const result = await ProductDAO.delete(req.params.id);

    if (result.success) {
      sendResponse(res, 200, true, "Product deleted", result.data);
    } else {
      sendResponse(res, 400, false, result.message);
    }
  } catch (error) {
    console.error("Delete product error:", error);
    sendResponse(res, 500, false, "Failed to delete product");
  }
});

// ===== ORDER ROUTES =====
router.get("/orders", JwtUtil.checkToken, async (req, res) => {
  try {
    const orders = await OrderDAO.selectAll();
    sendResponse(res, 200, true, "Orders retrieved", orders);
  } catch (error) {
    console.error("Get orders error:", error);
    sendResponse(res, 500, false, "Failed to retrieve orders");
  }
});

router.put("/orders/status/:id", JwtUtil.checkToken, async (req, res) => {
  try {
    console.log('PUT /orders/status', { id: req.params.id, status: req.body.status });
    const error = validateInput({
      id: req.params.id,
      status: req.body.status
    });
    if (error) return sendResponse(res, 400, false, error);

    const validStatuses = ["PENDING", "APPROVED", "REJECTED", "CANCELED", "CANCELLED", "SHIPPED", "DELIVERED", "COD_PENDING", "QR_PENDING"];
    const status = String(req.body.status || '').toUpperCase().trim();
    if (!validStatuses.includes(status)) {
      return sendResponse(res, 400, false, `Status must be one of: ${validStatuses.join(", ")}`);
    }

    const result = await OrderDAO.update(req.params.id, status);

    if (result) {
      sendResponse(res, 200, true, "Order status updated", result);
    } else {
      sendResponse(res, 400, false, "Order not found or update failed");
    }
  } catch (error) {
    console.error("Update order status error:", error);
    sendResponse(res, 500, false, "Failed to update order status");
  }
});

router.get("/orders/customer/:cid", JwtUtil.checkToken, async (req, res) => {
  try {
    if (!req.params.cid) {
      return sendResponse(res, 400, false, "Customer ID is required");
    }

    const orders = await OrderDAO.selectByCustID(req.params.cid);
    sendResponse(res, 200, true, "Customer orders retrieved", orders);
  } catch (error) {
    console.error("Get customer orders error:", error);
    sendResponse(res, 500, false, "Failed to retrieve customer orders");
  }
});

// Reset all orders to PENDING
router.put("/orders/reset/all", JwtUtil.checkToken, async (req, res) => {
  try {
    const result = await OrderDAO.updateAll("PENDING");
    if (result) {
      sendResponse(res, 200, true, `Successfully reset ${result.modifiedCount} orders to PENDING`, result);
    } else {
      sendResponse(res, 400, false, "Failed to reset orders");
    }
  } catch (error) {
    console.error("Reset all orders error:", error);
    sendResponse(res, 500, false, "Failed to reset all orders");
  }
});

// ===== CUSTOMER ROUTES =====
router.get("/customers", JwtUtil.checkToken, async (req, res) => {
  try {
    const customers = await CustomerDAO.selectAll();
    sendResponse(res, 200, true, "Customers retrieved", customers);
  } catch (error) {
    console.error("Get customers error:", error);
    sendResponse(res, 500, false, "Failed to retrieve customers");
  }
});

router.put("/customers/deactive/:id", JwtUtil.checkToken, async (req, res) => {
  try {
    const error = validateInput({
      id: req.params.id
    });
    if (error) return sendResponse(res, 400, false, error);

    const result = await CustomerDAO.active(req.params.id, null, 0);

    if (result) {
      sendResponse(res, 200, true, "Customer deactivated", result);
    } else {
      sendResponse(res, 404, false, "Customer not found or already deactivated");
    }
  } catch (error) {
    console.error("Deactivate customer error:", error);
    sendResponse(res, 500, false, "Failed to deactivate customer");
  }
});

router.get("/customers/sendmail/:id", JwtUtil.checkToken, async (req, res) => {
  try {
    if (!req.params.id) {
      return sendResponse(res, 400, false, "Customer ID is required");
    }

    const customer = await CustomerDAO.selectByID(req.params.id);

    if (!customer) {
      return sendResponse(res, 404, false, "Customer not found");
    }

    try {
      const emailSent = await EmailUtil.send(customer.email, customer._id, customer.token);
      sendResponse(res, 200, true, "Email sent successfully. Please check inbox");
    } catch (error) {
      console.error("Send email error:", error);
      sendResponse(res, 500, false, error.message || "Failed to send email");
    }
  } catch (error) {
    console.error("Send email error:", error);
    sendResponse(res, 500, false, "Failed to send email");
  }
});

module.exports = router;