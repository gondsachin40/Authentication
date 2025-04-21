const express = require("express");
const {
  registerUser,
  loginUser,
  logoutUser,
  addNote,
  getNotes,
  deleteNote,
  updateNote,
  markNoteStatus
} = require("../controllers/userController");
const authenticate = require("../middleware/authMiddleware");

const router = express.Router();

// Route to register a new user
router.post("/register", registerUser);

// Route to log in a user
router.post("/login", loginUser);

// Route to log out a user
router.post("/logout", logoutUser);

// Route to add a note (Protected)
router.post("/addNote", authenticate, addNote);

// Route to get all notes (Protected)   
router.get("/getNotes", authenticate, getNotes);

// Route to delete a note (Protected)   
router.delete("/deleteNote/:noteId", authenticate, deleteNote);

// Route to update a note (Protected)
router.put("/updateNote/:noteId", authenticate, updateNote);

//Route to mark status
router.put("/markNoteStatus/:noteId", authenticate, markNoteStatus);

module.exports = router;
