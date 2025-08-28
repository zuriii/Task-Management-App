const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth-controller");
const userController = require("../controllers/user-controller");

// ================== AUTH ROUTES ==================

router.post("/register", authController.signUp);
router.post("/login", authController.login);
router.get("/me", authController.protect, authController.getMe);

// ================== USER ROUTES ==================
// Get all users
router.get("/", authController.protect, userController.getAllUsers);

// Get single user by ID
router.get("/:id", authController.protect, userController.getUserById);

// Update user by ID
router.patch("/:id", authController.protect, userController.updateUser);

// Delete user by ID
router.delete("/:id", authController.protect, userController.deleteUser);

module.exports = router;
