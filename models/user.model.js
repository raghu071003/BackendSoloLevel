import mongoose,{Schema} from "mongoose";
import bcrypt from "bcrypt"
import { json } from "express";
import jwt from 'jsonwebtoken'
const userSchema = new Schema({
    email:{
        type:String,
        trim:true,
        lowercase:true
    },
    fullName:{
        type:String,
    },
    password:{
        type:String,
    },
    progress:{
        type : mongoose.Schema.Types.ObjectId,
        ref:"Progress"
    },
    refreshToken:{
        type:String
    },
    exp:{
        type:Number,
        default : 0
    },
    rank: {
    type: String,
    enum: [
      'E-Rank',
      'D-Rank',
      'C-Rank',
      'B-Rank',
      'A-Rank',
      'S-Rank',
    ],
    default:'E-Rank'
  },
},{timestamps:true})

userSchema.pre("save",async function(next) {
    if(!this.isModified("password")) return next();
    if (!this.password) return next();
    this.password = await bcrypt.hash(this.password,10)
    next()
})

userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id:this._id
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id : this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}
export const User = mongoose.model("User",userSchema)