const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    // callbackURL: "/api/auth/google/callback" // Must match Google Console
    callbackURL: process.env.GOOGLE_CALLBACK_URL || "/api/auth/google/callback" || "http://localhost:5000/api/auth/google/callback"
},
  async (accessToken, refreshToken, profile, done) => {
    try {
      // 1. Check if user exists by email
      let user = await User.findOne({ email: profile.emails[0].value });

      if (user) {
        // Link Google ID if not already linked
        if (!user.googleId) {
          user.googleId = profile.id;
          await user.save();
        }
        return done(null, user);
      }

      // 2. If new user, create them
      user = new User({
        name: profile.displayName,
        email: profile.emails[0].value,
        googleId: profile.id,
        // Password is purposefully left undefined
        profile: {
          avatar: profile.photos[0]?.value // Optional: Get Google Profile Pic
        }
      });
      await user.save();
      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }
));