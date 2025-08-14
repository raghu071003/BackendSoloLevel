import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

import {User} from "../models/user.model.js"; // your mongoose model

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "https://backendsololevel.onrender.com/api/v1/user/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ email: profile.emails[0].value });
      if (!user) {
        user = await User.create({
          fullName: profile.displayName,
          email: profile.emails[0].value,
          password: null,
          exp: 0,
          rank: "E-Rank",
        });
      }
      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }
));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});
