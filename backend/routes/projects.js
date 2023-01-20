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

router.route("/").get(getAllProject).post(createProject);
router.route("/stats").get(showStats)
router.route("/:id").get(getProject).patch(updateProject).delete(deleteProject)

module.exports = router;