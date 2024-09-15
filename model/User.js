const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    email: {
      type: String,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    password: { type: String },
    image: { type: String },
    mobile: { type: String, trim: true },
    whatsApp: { type: String, trim: true },
    fcm: { type: String },
    refreshToken: { type: String },
    lastLogin: { type: Date },
    role: {
      type: String,
      enum: ["super_admin"],
    },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { versionKey: false, timestamps: true }
);

schema.index(
  { email: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } }
);

schema.index(
  { mobile: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } }
);

module.exports = mongoose.model("users", schema);
