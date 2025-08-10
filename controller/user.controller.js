const checkWorking = (req, res) => {
    return res.send("Hello")
}
import bcrypt from 'bcrypt'
import { User } from "../models/user.model.js";
import { options } from '../constants.js';
const userLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json("Invalid user")
        }
        const isValid = await isValidPassword(password,user.password);
        
        if (!isValid) {
            return res.status(401).json("Invalid Password")
        }
        const { accessToken, refreshToken } = await generateTokens(user._id);
        const LoggedUser =  await User.findOne({ email }).select("-password -refereshToken")
        res.status(200).cookie("accessToken", accessToken, options).cookie("refreshToken", refreshToken, options).json({user:LoggedUser,message:"Logged in Successfully"});
    } catch (error) {
        console.log(error);
    }
}
const isValidPassword = async(password,stored)=>{
    return await bcrypt.compare(password,stored);
}
const registerUser = async (req, res) => {
    
    try {
        const { email, password, fullName } = req.body;
        
        if ([email, fullName, password].some((field) => field?.trim() === "")) {
            // throw new ApiError(400, "All fields are required");
            return res.status(400).json({
                message: "Please enter valid data"
            })
        }
        // Check for duplication
        const existedUser = await User.findOne({
            $or: [{ email }]
        })
        if (existedUser) {
            return res.status(409).json("User aldready exists!")
        }
        const user = await User.create({
            email: email,
            fullName: fullName,
            password: password,
        })
        const createdUser = await User.findById(user._id).select(
            "-password -refreshToken"
        )
        if (!createdUser) {
            return res.status(400).json("Error while creating User")
        }
        return res.status(200).json(
            "User Created~",
        )
    } catch (error) {
        console.log(error);
        
    }
}
const generateTokens = async (userId) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError(500, "Something Went Wrong")
    }
    try {
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: true })
        return { accessToken, refreshToken }

    } catch (error) {
        throw new Error(error?.message || "Invalid Request")
    }
}
const userLogout = async(req,res)=>{
    User.findOneAndUpdate(
        req.user._id,
        {
            refreshToken:undefined,
        },
        {new:true}
    )
    return res.status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(
        "User logged OUT"
    )
}
const userProfile = async(req,res) =>{
    const userId = req.user?._id;
    if(!userId){
        return res.status(402).json({message:"Unauthorised"});
    }
    try {
        const userProfile = await User.findById(userId).select("-refreshToken -password");
        return res.status(201).json({message:"Success",userProfile})
        
    } catch (error) {
        console.log(error);
        return res.status(400).json({message:"Something went Wrong!"})
    }
}
const authStatus = async (req, res) => {
  try {
    const userId = req.user?._id;
    const LoggedUser =  await User.findById(userId).select("-password -refereshToken")

    if (userId) {
      return res.status(200).json({ authenticated: true, user:LoggedUser });
    } 
    return res.status(401).json({ authenticated: false, message: 'User not authenticated' });
  } catch (error) {
    console.error('authStatus error:', error);
    return res.status(500).json({ authenticated: false, message: 'Server error' });
  }
};

export { checkWorking, userLogin, registerUser,userLogout,authStatus,userProfile }