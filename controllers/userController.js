const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.registerUser = async (req, res) => {
  const { name, email, password} = req.body;
  console.log("hello ",name)
  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "User already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email,
      passwordHash: hashedPassword
    });

    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Login User Function
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid email or password" });

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) return res.status(400).json({ message: "Invalid email or password" });

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Send token as an HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Set to true in production
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.logoutUser = (req, res) => {
  res.clearCookie("token").json({ message: "Logged out successfully" });
};


exports.addNote = async (req, res) => {
  const { content } = req.body;
  const userId = req.userId;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.notes.push({
      content,
      timestamp: new Date(),
      status: "unread",
    });
    await user.save();

    res.status(201).json({ message: "Note added successfully", notes: user.notes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.getNotes = async (req, res) => {
  const userId = req.userId;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });  
    console.log(user.notes)
    res.status(200).json({ notes: user.notes });  
  }
  catch (error) {
    res.status(500).json({ error: error.message });
  } 
}
exports.deleteNote = async (req, res) => {
  const { noteId } = req.params;
  const userId = req.userId;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });    
    const noteIndex = user.notes.findIndex(note => note._id.toString() === noteId);
    if (noteIndex === -1) return res.status(404).json({ message: "Note not found" });
    user.notes.splice(noteIndex, 1);
    await user.save();
    res.status(200).json({ message: "Note deleted successfully", notes: user.notes });
  }
  catch (error) {
    res.status(500).json({ error: error.message });
  }
}
exports.updateNote = async (req, res) => {
  const { noteId } = req.params;
  const { content } = req.body;
  const userId = req.userId;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const noteIndex = user.notes.findIndex(note => note._id.toString() === noteId);
    if (noteIndex === -1) return res.status(404).json({ message: "Note not found" });

    user.notes[noteIndex].content = content;
    await user.save();

    res.status(200).json({ message: "Note updated successfully", notes: user.notes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//mark as read to notes
exports.markNoteStatus= async (req, res) => {
  const { noteId } = req.params;
  const userId = req.userId;
  const { readStatus } = req.body; // Assuming status is passed in the request body

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    const noteIndex = user.notes.findIndex(note => note._id.toString() === noteId);
    if (noteIndex === -1) return res.status(404).json({ message: "Note not found" });
    user.notes[noteIndex].status = readStatus; // Update the status of the note
    await user.save();
    res.status(200).json({ message: "Note marked as read successfully", notes: user.notes });
  }
  catch (error) {
    res.status(500).json({ error: error.message });
  }
}