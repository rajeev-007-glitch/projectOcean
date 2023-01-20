const express = require("express")
const router = express.Router()

const {
  getAllProject,
  createProject,
  getProject,
  updateProject,
  deleteProject,
  showStats
} = require("../controllers/projects")

router.route("/").get(getAllProject);

module.exports = router;