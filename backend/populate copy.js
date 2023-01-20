require("dotenv").config()

const connectDb = require("./db/connect")
const Project = require("./models/project")

const jsonProjects = require("./projects.json")

const start = async ()=>{
    try {
        await connectDb(process.env.MONGO_URI)
        await Project.deleteMany()
        await Project.create(jsonProjects)
        console.log("Success")
        process.exit(0)
    } catch (error) {
        console.log(error)
        process.exit(1)
    }
}

start()