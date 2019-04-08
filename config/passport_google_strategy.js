var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const keys = require('./keys');

// Load User model
const User = require('../models/users');

module.exports = function (passport) {
    passport.use(new GoogleStrategy({
        clientID: keys.GOOGLE_CLIENT_ID,
        clientSecret: keys.GOOGLE_CLIENT_SECRET,
        callbackURL: keys.GOOGLE_CALLBACK
    }, async (accessToken, refreshToken, profile, done) => {
            try {

                console.log(accessToken);
                console.log(refreshToken);
                console.log(profile);
                console.log(done);

                let user = await User.find({googleId: profile.id});

                if (user) {
                    user = await User.create({
                        name: profile.name.givenName,
                        email: profile.emails[0].value,
                        googleId: profile.id
                    });
                }
                return done(null, user);            
            } catch (error) {
                console.log(error);
                return done(error);
            }
        })
    );
};