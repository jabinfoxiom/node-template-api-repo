const mongoose = require("mongoose");
const Schema = mongoose.Schema; // Ensure you have this line

const schema = new mongoose.Schema(
  {
    user: { type: mongoose.Types.ObjectId },
    url: { type: String },
    method: { type: String },
    jsonBody: { type: Object },
    params: { type: Object },
    query: { type: Object },
    status: { type: Object },
    error: { type: Object },
    message: { type: Object },
    stack: { type: Schema.Types.Mixed },
    isCron: { type: Boolean, default: false },
  },
  { versionKey: false, timestamps: true }
);

module.exports = mongoose.model("errorlogs", schema);
