var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/login', function(req, res, next) {
    res.render('auth/login', { title: 'Plainsurf | Login', layout: '/layouts/auth_layouts' });
});


/* GET users listing. */
router.get('/signup', function(req, res, next) {
    res.render('auth/signup', { title: 'Plainsurf | Sign up', layout: '/layouts/auth_layouts' });
});

router.post('/login', function(req, res, next) {
    console.log(req.body)
     res.json(req.body);
});

router.post('/signup', function(req, res, next) {
    console.log(req.body)
     res.json(req.body);
});

module.exports = router;