const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');

// Load User model
const User = require('../models/users');

module.exports = function (passport) {
    passport.use(new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
            try {
                console.log("FIRST :)");
                const user = await User.findOne({ email: email });

                if (!user) {
                    return done(null, false, { message: 'That email is not registered' });
                }

                const match = bcrypt.compareSync(password, user.password);

                if (match) {
                    return done(null, user);
                } else {
                    return done(null, false, { message: 'Password incorrect' });
                }
            } catch (error) {
                return done(e);
            }
        })
    );

    passport.serializeUser(function (user, done) {
        console.log("SECOND :)");
        done(null, user.id);
    });

    passport.deserializeUser(async function (id, done) {
        console.log("THIRD :)");
        try {
            let user = await User.findById(id);
            if (!user) {
                return done(new Error('user not found'));
            }
            done(null, user);
        } catch (e) {
            done(e);
        }
    });
};