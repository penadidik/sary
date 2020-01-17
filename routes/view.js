var express = require('express');
var router = express.Router();
var csrf = require('csurf');
var csrfProtection = csrf({ cookie: true });
var authService = require(global.config.dir.services + 'auth');

router.get('', csrfProtection, function (req, res, next) {
	authService.requireAuthLogin(req, res, next);
});

router.get('/register', csrfProtection, function (req, res, next) {
	res.render('register', {
    title: 'Smart Room System',
    csrfToken : req.csrfToken()
	});
});

router.get('/configuration', csrfProtection, function (req, res, next) {
	res.render('contents/configuration', {
    title: 'Smart Room System',
    csrfToken : req.csrfToken()
	});
});

router.get('/dashboard', csrfProtection, function (req, res, next) {
	res.render('contents/dashboard', {
    title: 'Smart Room System',
    csrfToken : req.csrfToken()
	});
});

router.get('/statistichistory', csrfProtection, function (req, res, next) {
	res.render('contents/statistichistory', {
    title: 'Smart Room System',
    csrfToken : req.csrfToken()
	});
});

router.get('/statistichistoryfloor', csrfProtection, function (req, res, next) {
	res.render('contents/statistichistoryfloor', {
    title: 'Smart Room System',
    csrfToken : req.csrfToken()
	});
});

router.get('/statistichistoryall', csrfProtection, function (req, res, next) {
	res.render('contents/statistichistoryall', {
    title: 'Smart Room System',
    csrfToken : req.csrfToken()
	});
});

router.get('/graphhistory', csrfProtection, function (req, res, next) {
	res.render('contents/graphhistory', {
    title: 'Smart Room System',
    csrfToken : req.csrfToken()
	});
});

router.get('/graphhistoryall', csrfProtection, function (req, res, next) {
	res.render('contents/graphhistoryall', {
    title: 'Smart Room System',
    csrfToken : req.csrfToken()
	});
});

router.get('/management', csrfProtection, function (req, res, next) {
	res.render('contents/management', {
    title: 'Smart Room System',
    csrfToken : req.csrfToken()
	});
});

router.get('/controlhistory', csrfProtection, function (req, res, next) {
	res.render('contents/controlhistory', {
    title: 'Smart Room System',
    csrfToken : req.csrfToken()
	});
});

router.get('/administrator', csrfProtection, function (req, res, next) {
	res.render('contents/administrator', {
    title: 'Smart Room System',
    csrfToken : req.csrfToken()
	});
});

router.get('/roomcontrol', csrfProtection, function (req, res, next) {
	res.render('contents/roomcontrol', {
    title: 'Smart Room System',
    csrfToken : req.csrfToken()
	});
});
module.exports = router;