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
const updateProgress = async (req, res) => {
  const userId = req.user?._id;
  const { topicName, problemName, done,xpChange } = req.body;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    // 1️⃣ Get current Done value from DB
    const user = await User.findOne(
      { _id: userId, "progress.topicName": topicName },
      { "progress.$": 1 } // only matched topic
    );

    if (!user || !user.progress.length) {
      return res.status(404).json({ message: "Topic not found" });
    }

    // Find the specific question
    const topic = user.progress[0];
    const question = topic.questions.find(q => q.Problem === problemName);

    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    // 2️⃣ If same value → skip
    if (question.Done === done) {
      return res.status(200).json({ message: "No change needed" });
    }
    const updateOps = {
  $set: {
    "progress.$[topic].questions.$[q].Done": done
  },
  ...(done
    ? { $inc: { "progress.$[topic].doneQuestions": 1, exp: xpChange } }
    : { $inc: { "progress.$[topic].doneQuestions": -1, exp: xpChange } }),
};

    // 4️⃣ Update DB
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateOps,
      {
        arrayFilters: [
          { "topic.topicName": topicName },
          { "q.Problem": problemName }
        ],
        new: true
      }
    );

    res.json({
      message: "Progress updated successfully",
      updatedUser
    });

  } catch (error) {
    res.status(500).json({ message: "Error updating progress", error });
  }

};

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

const leaderboard = async(req,res)=>{
    try {
    const leaderboard = await User.find({}, { fullName: 1, exp: 1, _id: 0 })
      .sort({ exp: -1 }) // highest XP first
      .limit(20); // top 20 players
    res.json(leaderboard);
  } catch (err) {
    res.status(500).json({ message: "Error fetching leaderboard" });
  }
}

import dotenv from "dotenv"
dotenv.config({
    path:"../.env"
})
// controller/user.controller.js
import { GoogleGenerativeAI } from "@google/generative-ai";

// Init Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Retry helper
async function retryWithBackoff(fn, retries = 3, delay = 1000) {
  try {
    return await fn();
  } catch (err) {
    if (retries > 0 && err.status === 503) {
      console.warn(`Model overloaded, retrying in ${delay}ms...`);
      await new Promise(res => setTimeout(res, delay));
      return retryWithBackoff(fn, retries - 1, delay * 2);
    }
    throw err;
  }
}

// Controller
const getHelp = async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: "Problem URL is required" });
    }

    const prompt = `
I have a coding problem here: ${url}
Please explain step-by-step how to approach and solve it.
Include:
1. How to understand the problem
2. A possible step-by-step solution plan
3. Time complexity analysis
4. Space complexity analysis
Format your answer in Markdown.
    `;

    const result = await retryWithBackoff(() =>
      model.generateContent(prompt)
    );

    const explanation = result.response.text();
    res.json({ explanation });

  } catch (err) {
    console.error("Error in getHelp:", err);
    res.status(err.status === 503 ? 503 : 500).json({
      error:
        err.status === 503
          ? "AI service is overloaded. Please try again in a few seconds."
          : "Something went wrong while fetching AI help.",
    });
  }
};



export { checkWorking, userLogin, registerUser,userLogout,authStatus,userProfile,updateProgress,leaderboard ,getHelp}