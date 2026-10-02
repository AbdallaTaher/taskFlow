const express = require("express");
const {
  getAllTasks,
  getDashboardStats,
  createTask,
  getTask,
  updateTask,
  deleteTask,
  addChecklistItem,
  toggleChecklistItem,
  deleteChecklistItem,
} = require("../controllers/taskController");
const { protect } = require("../controllers/authController");

const router = express.Router();

router.use(protect);

router.route("/dashboard-stats").get(getDashboardStats);
router.route("/").get(getAllTasks).post(createTask);
router.route("/:id").get(getTask).patch(updateTask).delete(deleteTask);
router.route("/:id/checklist").post(addChecklistItem);
router
  .route("/:id/checklist/:itemId")
  .patch(toggleChecklistItem)
  .delete(deleteChecklistItem);

module.exports = router;
