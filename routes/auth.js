var express = require('express');
var router = express.Router();
var csrf = require('csurf')
var bodyParser = require('body-parser')
var { check, validationResult } = require('express-validator/check')
const bcrypt = require('bcryptjs');
const passport = require('passport');

// Load User model
const User = require('../models/users');

/** setup csrf route middlewares */
var csrfProtection = csrf({ cookie: true })
var parseForm = bodyParser.urlencoded({ extended: false })


// Logout
router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/login');
});

/***********************************************************/
/** Begin login */
/***********************************************************/
router.get('/login', csrfProtection, function (req, res, next) {
    res.render('auth/login', { title: 'Plainsurf | Login', csrfToken: req.csrfToken(), layout: '/layouts/auth_layouts' });
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
/** Begin signup */
/***********************************************************/
router.get('/signup', csrfProtection, function (req, res, next) {
    res.render('auth/signup', { title: 'Plainsurf | Sign up', csrfToken: req.csrfToken(), layout: '/layouts/auth_layouts' });
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
            layout: '/layouts/auth_layouts',
            name: name,
            email: email,
            'error_msg': error.message
        });
    }
});
/***********************************************************/
/** End signup */
/***********************************************************/

module.exports = router;