import express from 'express'
import cookieParser from 'cookie-parser';
const app = express();
import cors from 'cors';

const corsOptions = {
  origin: 'http://localhost:5173',  // e.g., "http://localhost:3000" or "https://yourdomain.com"
  credentials: true,           // if you want to allow cookies/auth headers
  optionsSuccessStatus: 200    // some legacy browsers choke on 204
};

app.use(cors(corsOptions));


app.use(express.json())
app.use(cookieParser())
app.use(session({
  secret: "solo_leveling_secret",
  resave: false,
  saveUninitialized: true,
}));

app.use(passport.initialize());
app.use(passport.session());
import UserRouter from './Routes/user.routes.js';  
import session from 'express-session';
import passport from 'passport';
app.use("/api/v1/user",UserRouter)

// import passport from "passport";
// import { Strategy as GoogleStrategy } from "passport-google-oauth20";

// import {User} from "./models/user.model.js"; // your mongoose model

// passport.use(new GoogleStrategy({
//     clientID: process.env.GOOGLE_CLIENT_ID,
//     clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//     callbackURL: "http://localhost:8090/api/v1/user/auth/google/callback"
//   },
//   async (accessToken, refreshToken, profile, done) => {
//     try {
//       let user = await User.findOne({ email: profile.emails[0].value });
//       if (!user) {
//         user = await User.create({
//           fullName: profile.displayName,
//           email: profile.emails[0].value,
//           password: null,
//           exp: 0,
//           rank: "E-Rank",
//         });
//       }
//       return done(null, user);
//     } catch (err) {
//       return done(err, null);
//     }
//   }
// ));

// passport.serializeUser((user, done) => done(null, user.id));
// passport.deserializeUser(async (id, done) => {
//   const user = await User.findById(id);
//   done(null, user);
// });


export {app};