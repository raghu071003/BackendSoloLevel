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
import UserRouter from './Routes/user.routes.js';
app.use("/api/v1/user",UserRouter)



//Google oauth
// import passport from 'passport';
// import session from 'express-session';
// import { User } from './models/user.model.js';
// import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
// app.use(session({ secret: "your-session-secret", resave: false, saveUninitialized: false }));
// app.use(passport.initialize());
// app.use(passport.session());
// passport.use(new GoogleStrategy({
//     clientID: process.env.GOOGLE_CLIENT_ID,
//     clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//     callbackURL: "/auth/google/callback",
//   },
//   async (accessToken, refreshToken, profile, done) => {
//     try {
//       // Find or create user in your DB based on Google profile
//       let user = await User.findOne({ googleId: profile.id });

//       if (!user) {
//         // Create user if they don't exist
//         user = await User.create({
//           googleId: profile.id,
//           email: profile.emails[0].value,
//           fullName: profile.displayName,
//           // You might want to add a flag (e.g. isGoogleUser: true)
//         });
//       }
//       return done(null, user);
//     } catch (err) {
//       return done(err, null);
//     }
//   }
// ));

// // Serialize user for session
// passport.serializeUser((user, done) => done(null, user._id));
// passport.deserializeUser(async (id, done) => {
//   const user = await User.findById(id);
//   done(null, user);
// });
export {app};