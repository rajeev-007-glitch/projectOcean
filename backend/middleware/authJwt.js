const jwt  = require("jsonwebtoken")
const { UnauthenticatedError, NotFoundError } = require("../errors")

const { TokenExpiredError } = jwt

const catchError = (err, res)=>{
    if(err instanceof TokenExpiredError){
        throw new UnauthenticatedError("Unauthorized! Access Token was expired!")
    }
    throw new UnauthenticatedError("Unauthorized!")
}

const verifyToken = (req, res, next)=>{
    const authHeaders = req.headers.authorization
  if (!authHeaders || !authHeaders.startsWith("Bearer ")) {
    throw new UnauthenticatedError("Authentication Invalid 1st one")
  }
  const token = authHeaders.split(" ")[1]

  if(!token){
    throw new NotFoundError("Token not found")
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded)=>{
    if(err){
        return catchError(err, res)
    }
    req.userId = decoded.id
    next();
  })
}