var express = require('express');
var router = express.Router();
var csrf = require('csurf')
var bodyParser = require('body-parser')
var { check, validationResult } = require('express-validator/check')
const { sanitizeBody } = require('express-validator/filter');

/** setup csrf route middlewares */
var csrfProtection = csrf({ cookie: true })
var parseForm = bodyParser.urlencoded({ extended: false })

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

        return res.json(req.body);
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

router.post('/signup', signupValidationOptions, parseForm, csrfProtection, function (req, res, next) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(422).json({ errors: errors.array() });
        }
        
        return res.json(req.body);
    } catch (error) {
        res.json({ "message": error.message });
    }
});
/***********************************************************/
/** End signup */
/***********************************************************/

module.exports = router;