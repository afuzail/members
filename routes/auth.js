var express = require('express');
var router = express.Router();
var csrf = require('csurf')
var bodyParser = require('body-parser')
var { check, validationResult } = require('express-validator/check')
const bcrypt = require('bcryptjs');
const passport = require('passport');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const email_username = require('../config/keys').EMAIL_USERNAME;
const email_password = require('../config/keys').EMAIL_PASSWORD;

/** Load User model */
const User = require('../models/users');

/** setup csrf route middlewares */
const csrfProtection = csrf({ cookie: true })
const parseForm = bodyParser.urlencoded({ extended: false })
const smtp_transport = nodemailer.createTransport({
    service: 'SendGrid',
    auth: {
        user: email_username,
        pass: email_password
    },
    tls: { rejectUnauthorized: false },
    debug: true,
    secure: false
});

/** Logout */
router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/login');
});

/***********************************************************/
/** Begin login */
/***********************************************************/
router.get('/login', csrfProtection, function (req, res, next) {
    res.render('auth/login', { title: 'Plainsurf | Login', csrfToken: req.csrfToken() });
});


const loginValidationOptions = [
    check('email')
        .isEmail().withMessage('must be valid email')
        .normalizeEmail(),
    check('password')
        .isLength({ min: 5 }).withMessage('must be at least 5 chars long')
];

router.post('/login', loginValidationOptions, parseForm, csrfProtection, function (req, res, next) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }

        passport.authenticate('local', {
            successRedirect: '/',
            failureRedirect: '/login',
            failureFlash: true
        })(req, res, next);

        // return res.json(req.body);
    } catch (error) {
        res.json({ "message": error.message });
    }

});
/***********************************************************/
/** End login */
/***********************************************************/

/***********************************************************/
/** Begin login with google */
/***********************************************************/
router.get('/auth/google', passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email'] }));

router.get('/auth/google/callback', function (req, res, next) {
    passport.authenticate('google', {
        successRedirect: '/',
        failureRedirect: '/login',
        failureFlash: true
    })(req, res, next);
});


/***********************************************************/
/** End login with google */
/***********************************************************/


/***********************************************************/
/** Begin signup */
/***********************************************************/
router.get('/signup', csrfProtection, function (req, res, next) {
    res.render('auth/signup', { title: 'Plainsurf | Sign up', csrfToken: req.csrfToken() });
});

const signupValidationOptions = [
    check('name')
        .not().isEmpty().withMessage('Name is required')
        .escape(),
    check('email')
        .isEmail().withMessage('Please enter a valid email address.')
        .normalizeEmail(),
    check('password')
        .isLength({ min: 5 }).withMessage('The password must be at least 5 chars long')
];

router.post('/signup', signupValidationOptions, parseForm, csrfProtection, async function (req, res, next) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }

        console.log(req.session)

        const { name, email, password } = req.body;
        const user = await User.findOne({ email: email });
        if (user) {
            res.render('auth/signup', {
                title: 'Plainsurf | Sign up',
                csrfToken: req.csrfToken(),
                layout: '/layouts/auth_layouts',
                name: name,
                email: email,
                'error_msg': 'User already exists.'
            });
        } else {
            const newUser = new User({
                name: name,
                email: email,
                password: password
            })

            const salt = bcrypt.genSaltSync(10);
            const hash = bcrypt.hashSync(newUser.password, salt);

            newUser.password = hash;
            const newUserRes = await newUser.save();

            req.flash('success_msg', 'You are now registered and can log in.');
            res.redirect('/login');
        }
        // return res.json(req.body);
    } catch (error) {
        res.render('auth/signup', {
            title: 'Plainsurf | Sign up',
            csrfToken: req.csrfToken(),
            name: name,
            email: email,
            'error_msg': error.message
        });
    }
});
/***********************************************************/
/** End signup */
/***********************************************************/

/***********************************************************/
/** Begin forgot password */
/***********************************************************/
router.get('/forgot-password', csrfProtection, function (req, res, next) {
    res.render('auth/forgot-password', { title: 'Plainsurf | Login', csrfToken: req.csrfToken() });
});


const forgotPasswordValidationOptions = [
    check('email')
        .isEmail().withMessage('must be valid email')
        .normalizeEmail()
];

router.post('/forgot-password', forgotPasswordValidationOptions, parseForm, csrfProtection, async function (req, res, next) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }

        /** Check user exists in the database */
        const user = await User.findOne({ email: req.body.email });

        /** Create forgotPasswordToken and Time for him for user */
        if (user) {
            const buffer = await crypto.randomBytes(20);
            user.resetPasswordToken = buffer.toString('hex');
            user.resetPasswordExpires = Date.now() + 3600000;

            const isSaved = await user.save();

            if (isSaved) {
                const mail_options = {
                    to: user.email,
                    from: 'fuzail1280@gmail.com',
                    subject: 'Plainsurf Password Reset',
                    text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                        'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                        'http://' + req.headers.host + '/reset-password/' + user.resetPasswordToken + '\n\n' +
                        'If you did not request this, please ignore this email and your password will remain unchanged.\n'
                };


                const isMailSent = await smtp_transport.sendMail(mail_options);

                if (isMailSent) {
                    req.flash('success_msg', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
                    res.redirect('/login');
                } else {
                    req.flash('error_msg', 'Sorry :(, Problem in email sending.');
                    res.redirect('/forgot-password');
                }
            }
        } else {
            req.flash('error_msg', 'Email does not exists.');
            res.redirect('/forgot-password');
        }

        /** Email the user */

        return res.json(req.body);
    } catch (error) {
        console.log(error);
        req.flash('error_msg', 'We are very sorry :(, Because of some technical problem we are unable to process your request.');
        return res.redirect('/forgot-password');
    }

});
/***********************************************************/
/** End forgot password */
/***********************************************************/


/***********************************************************/
/** Begin reset password */
/***********************************************************/
router.get('/reset-password/:token', csrfProtection, async function (req, res, next) {
    try {
        const token = req.params.token;
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            req.flash('error_msg', 'Password reset token is invalid or has expired.');
            return res.redirect('/forgot-password');
        }

        res.render('auth/reset-password', { title: 'Plainsurf | Reset Password', csrfToken: req.csrfToken(), resetPasswordToken: token });
    } catch (error) {
        console.log(error.message);
        req.flash('error_msg', 'We are very sorry :(, Because of some technical problem we are unable to process your request.');
        return res.redirect('/forgot-password');
    }
});


router.post('/reset-password/:token', parseForm, csrfProtection, async function (req, res, next) {
    const token = req.params.token;
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }

        
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            req.flash('error_msg', 'Password reset token is invalid or has expired.');
            return res.redirect('/forgot-password');
        }

        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(req.body.password, salt);

        user.password = hash;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;


        const result = await user.save();
        if (result) {
            const mail_options = {
                to: user.email,
                from: 'fuzail1280@gmail.com',
                subject: 'Your password has been changed',
                text: 'Hello,\n\n' +
                    'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
            };

            const isMailSent = await smtp_transport.sendMail(mail_options);

            if (isMailSent) {
                req.flash('success_msg', 'Success! Your password has been changed.');
                res.redirect('/');
            } else {
                req.flash('error_msg', 'Sorry :(, Problem in email sending, but password changed successfully.');
                res.redirect('/');
            }
        }

    } catch (error) {
        console.log(error.message);
        req.flash('error_msg', 'We are very sorry :(, Because of some technical problem we are unable to process your request.');
        return res.redirect(`/reset-password/${token}`);
    }
});
/***********************************************************/
/** End reset password */
/***********************************************************/
module.exports = router;