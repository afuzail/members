var express = require('express');
var router = express.Router();
var csrf = require('csurf')
var bodyParser = require('body-parser')

// setup csrf route middlewares
var csrfProtection = csrf({ cookie: true })
var parseForm = bodyParser.urlencoded({ extended: false })



/* GET users listing. */
router.get('/login', csrfProtection, function (req, res, next) {
    res.render('auth/login', { title: 'Plainsurf | Login', csrfToken: req.csrfToken(), layout: '/layouts/auth_layouts' });
});


/* GET users listing. */
router.get('/signup', csrfProtection, function (req, res, next) {
    res.render('auth/signup', { title: 'Plainsurf | Sign up', csrfToken: req.csrfToken(), layout: '/layouts/auth_layouts' });
});

router.post('/login', parseForm, csrfProtection, function (req, res, next) {
    try {
        return res.json(req.body);
    } catch (error) {
        res.json({ "message": error.message });
    }

});

router.post('/signup', parseForm, csrfProtection, function (req, res, next) {
    try {
        return res.json(req.body);
    } catch (error) {
        res.json({ "message": error.message });
    }
});

module.exports = router;