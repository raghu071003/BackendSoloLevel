import {Router} from 'express'
import { authStatus, checkWorking, getHelp, leaderboard, registerUser, updateProgress, userLogin, userLogout, userProfile } from '../controller/user.controller.js';
import { verifyJwt } from '../Middleware/auth.middleware.js';
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
export default router;