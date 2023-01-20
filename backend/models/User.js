const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")
const JWT = require('jsonwebtoken')
require('dotenv').config();

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "please provide a name"],
    minlength: 3,
    maxlength: 50,
  },
  lastName: {
    type: String,
    trim: true,
    maxlength: 20,
    default: 'lastName',
  },
  location: {
    type: String,
    trim: true,
    maxlength: 20,
    default: 'my city',
  },
  email: {
    type: String,
    required: [true, "please provide a email"],
    match: [
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      "please provide a valid email",
    ],
    unique: true,
  } ,
  password: {
    type: String,
    required: [true, "please provide a password"],
    minlength: 6,
  },
})

userSchema.pre("save", async function () {
  if(!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
})

userSchema.methods.createJWT = function (){
  return JWT.sign({userId:this._id, name:this.name}, process.env.JWT_SECRET, {noTimestamp:true})
}

userSchema.methods.comparePassword = async function(providedPassword){
  const isMatch = await bcrypt.compare(providedPassword, this.password)
  return isMatch
}

module.exports = mongoose.model("User", userSchema)
