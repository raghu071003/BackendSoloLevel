import {Router} from 'express'
import { authStatus, checkWorking, generateTokens, getHelp, leaderboard, registerUser, updateProgress, userLogin, userLogout, userProfile } from '../controller/user.controller.js';
import { verifyJwt } from '../Middleware/auth.middleware.js';
import jwt from 'jsonwebtoken'
import passport from 'passport';
import { options } from '../constants.js';
const router = Router();

router.route('/').get(checkWorking)
router.route('/signup').post(registerUser)
router.route('/login').post(userLogin)
router.route('/logout').post(verifyJwt, userLogout)
router.route('/authStatus').post(verifyJwt,authStatus);
router.route('/profile').post(verifyJwt,userProfile)
router.route('/updateProgress').post(verifyJwt,updateProgress);
router.route('/leaderboard').post(verifyJwt,leaderboard);
router.route('/getHelp').post(verifyJwt,getHelp);
router.get("/auth/google", passport.authenticate("google", {
  scope: ["profile", "email"]
}))
router.get("/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  async(req, res) => {
    // Successful authentication

    console.log(req.user);
    
    const {accessToken,refreshToken} = await generateTokens(req.user._id )
    res.cookie("accessToken", accessToken, options);
    res.cookie("refreshToken", refreshToken, options);

    // Redirect to frontend home page
    res.redirect("http://localhost:5173/loginSuccess");
  }
);
export default router;