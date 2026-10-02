const express = require("express");
const {
  signup,
  login,
  logout,
  protect,
  getMe,
  updateMyPassword,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");
const { updateMe, uploadUserPhoto } = require("../controllers/userController");

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/logout", logout);
router.post("/forgotPassword", forgotPassword);
router.patch("/resetPassword/:token", resetPassword);

// Protect all routes below
router.use(protect);

router.get("/me", getMe);
router.patch("/updateMyPassword", updateMyPassword);
router.patch("/updateMe", uploadUserPhoto, updateMe);

module.exports = router;
