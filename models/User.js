const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    phone: { type: String},
    gender: { type: String },
    dob: { type: Date },
    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
      country: String,
    },
    notes: [
      {
        content: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        status: { type: String, enum: ['read', 'unread'], default: 'unread' }
      }
    ]
  },
  
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
