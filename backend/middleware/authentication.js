const User = require("../models/User")
const JWT = require("jsonwebtoken")
const { UnauthenticatedError } = require("../errors")

const authenticateUser = async (req, res, next) => {
  const authHeaders = req.headers.authorization
  if (!authHeaders || !authHeaders.startsWith("Bearer ")) {
    throw new UnauthenticatedError("Authentication Invalid 1st one")
  }
  const token = authHeaders.split(" ")[1]

  try {
    const payload = JWT.verify(token, process.env.JWT_SECRET)
    req.user = { userId: payload.userId, name: payload.name }
    next()
  } catch (error) {
    console.log(error)
    throw new UnauthenticatedError("Authentication Invalid 2nd one")
  }
}

module.exports = authenticateUser
