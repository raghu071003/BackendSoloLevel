import { User } from "../models/user.model.js"
import jwt from 'jsonwebtoken'
const verifyJwt = async(req,res,next)=>{
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")    
        
        if(!token){
            throw new Error("Unauthorized Request")
        }
        const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
        // console.log(decodedToken);
        
    
        const user  =await User.findById(decodedToken._id)
        
    
        if(!user){
            throw new Error("Invalid Access Token");
        }
    
        req.user = user
        // console.log(user);
        
        next()
    } catch (error) {
        throw new Error( error?.message || "Something Went Wrong")
    }

}
export {verifyJwt}