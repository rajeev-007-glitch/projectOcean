require("dotenv").config()
require("express-async-errors")

// Security Imports
const path = require('path')
const helmet = require("helmet")
const xss = require("xss-clean")

const express = require("express")
const app = express()
// app.use(express.static('./public'));
// app.use(express.urlencoded({extended:false}))

// connect DB
const connectDb = require("./db/connect")
// routers
const authRouter = require("./routes/auth")
const projectRouter = require("./routes/projects")
const router = require("./routes/router")

// error handler
const notFoundMiddleware = require("./middleware/not-found")
const errorHandlerMiddleware = require("./middleware/error-handler")
const authenticateUser = require("./middleware/authentication")

// extra packages
// app.use(express.static('./public'))
app.use(express.json())
app.use(helmet())
app.use(xss())
// app.use(express.static('./public'))

// routes
app.use("/api/v1/auth", authRouter)
app.use("/api/v1/router", router)
app.use("/api/v1/projects",authenticateUser, projectRouter)
// app.use("/api/v1/projects", projectRouter)

app.use(express.json())
app.use(notFoundMiddleware)
app.use(errorHandlerMiddleware)

const port = process.env.PORT || 8080

const start = async () => {
  try {
    await connectDb(process.env.MONGO_URI)
    console.log("Connected to DB...")
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    )
  } catch (error) {
    console.log(error)
  }
}

start()
