const mongoose = require("mongoose")

const projectSchema = new mongoose.Schema(
  {
    projectName: {
      type: String,
      required: [true, "project name must be provided."],
      trim: true,
    },
    discription: {
      type: String,
      required: [true, "project discription must be provided."],
    },
    author: {
      type: [String],
      required: [true, "can't post project without an author."],
    },
    collaborator: {
      type: [String],
    },
    technologyUsed: {
      type: [String],
      required: [true, "can't post project without any technologyr."],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    createdBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: [true, "Please provide user"],
    },
    rating: {
      type: Number,
      default: 4.5,
    },
    deployment: {
      type: String,
      default: "github.com",
    },
    code: {
      type: String,
      default: "github.com",
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model("Project", projectSchema)
