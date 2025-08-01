import {Router} from 'express'
import { authStatus, checkWorking, registerUser, userLogin, userLogout } from '../controller/user.controller.js';
import { verifyJwt } from '../Middleware/auth.middleware.js';
const router = Router();

router.route('/').get(checkWorking)
router.route('/signup').post(registerUser)
router.route('/login').post(userLogin)
router.route('/logout').post(verifyJwt, userLogout)
router.route('/authStatus').post(verifyJwt,authStatus);

export default router;