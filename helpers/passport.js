const passport = require("passport");
const { Strategy: GoogleStrategy } = require("passport-google-oauth20");

//initialize 
passport.use(
  new GoogleStrategy(
    {

      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:5000/auth/google/callback", 
      passReqToCallback: true,
    },

// returns the authenticated email profile
 async function (request, accessToken, refreshToken, profile, done) {
     return done(null, profile);
    }
  )
);

// function to serialize a user/profile object into the session
passport.serializeUser(function (user, done) {
  done(null, user);
});

// function to deserialize a user/profile object into the session
passport.deserializeUser(function (user, done) {
  done(null, user);
});