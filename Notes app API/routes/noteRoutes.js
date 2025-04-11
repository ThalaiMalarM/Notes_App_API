const express = require("express");
const router = express.Router();
const {
  createNote,
  getNotes,
  updateNote,
  deleteNote,
  toggleFavorite,
  getFavorites,
} = require("../controllers/noteController");

const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, createNote);
router.get("/", protect, getNotes);
router.put("/:id", protect, updateNote);
router.delete("/:id", protect, deleteNote);

router.put("/:id/favorite", protect, toggleFavorite);
router.get("/favorites", protect, getFavorites);

module.exports = router;
