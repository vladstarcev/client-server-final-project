//REQUIRING PACKAGES AND EXPRESS BASIC SET UP
const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const fs = require('fs');
const ejs = require('ejs');
const bcrypt = require('bcrypt');
const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(passport.initialize());
app.use(passport.session());


// VARIABLES AND DUMMY DB
var users = [];
var promoCodes = [
    { id: 1, promoCode: '3XCRt', description: '10% discount' },
    { id: 2, promoCode: '4DFG', description: 'My desc.' },
    { id: 3, promoCode: '6DSQW', description: 'My new description.' }
];


// LOGIN WITH FACEBOOK
var FACEBOOK_APP_ID = '1094660150915546';
var FACEBOOK_APP_SECRET = '8244fa995e24dcf0d0d6febed46b2156';
passport.use(new FacebookStrategy({
    clientID: FACEBOOK_APP_ID,
    clientSecret: FACEBOOK_APP_SECRET,
    callbackURL: 'http://localhost:3000/auth/facebook/callback',
    profileFields: ['emails', 'name']
},
    function (accessToken, refreshToken, profile, done) {
        var user = {
            email: profile.emails[0].value,
            password: 'facebook',
            firstName: profile.name.givenName,
            lastName: profile.name.familyName,
            promoCode: ''
        }

        if (!users.some(e => e.email === user.email))
            users.push(user);

        return done(null, user);
    }
));

passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (user, done) {
    done(null, user);
});


//READING DATA FROM JSON
let rawdata = fs.readFileSync('cell_phone_data.json');
let data = JSON.parse(rawdata);





//GET REQUESTS HANDLING
app.get("/", function (req, res) {
    res.sendFile(__dirname + "/login.html");
});

app.get("/forgotPassword", function (req, res) {
    res.sendFile(__dirname + "/forgot-password.html")
});

app.get("/register", function (req, res) {
    res.sendFile(__dirname + "/register.html");
});

app.get('/updatePassword', function (req, res) {
    res.sendFile(__dirname + '/PasswordUpdate.html');
});

app.get('/index', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

// facebook redirections when loging in
app.get('/auth/facebook', passport.authenticate('facebook', { authType: 'reauthenticate', scope: ['email'] }));
app.get('/auth/facebook/callback', passport.authenticate('facebook', { successRedirect: '/index', failureRedirect: '/' }));


//POST REQUESTS HANDLING
app.post("/verifyCaptcha", function (req, res) {
    // user didn't check the captcha
    var response = req.body.captcha;
    if (response === undefined || response === "" || response === null) {
        return res.json({ "success": false, "message": "Captcha must be selected" });
    }

    // verification process
    const seceretKey = "6Lclg_wUAAAAAOxx9MOtnLi5Rq9l9q18j5r3ZpYE";
    const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${seceretKey}&response=${response}&remoteip=${req.connection.remoteAddress}`;
    request(verifyUrl, function (error, response, body) {
        body = JSON.parse(body);

        // verification failed
        if (body.success !== undefined && !body.success) {
            return res.json({ "success": false, "message": "Failed captcha verification" });
        }

        // verification succeed
        return res.json({ "success": true, "message": "Captcha verification succeed" });
    });
});

app.post("/registerUser", async function (req, res) {
    try {
        var salt = await bcrypt.genSalt();
        var hashedPassword = await bcrypt.hash(req.body.inputPassword, salt);

        var user = {
            email: req.body.inputEmail,
            password: hashedPassword,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            promoCode: req.body.promoCode
        }

        if (!users.some(e => e.email === user.email) && (promoCodes.some(e => e.promoCode === user.promoCode) || user.promoCode === '' || user.promoCode === null))
            users.push(user);

        res.redirect("/")
    } catch { res.status(500).send(); }
});

app.post('/login', async function (req, res) {
    var user = users.find(user => user.email === req.body.email);
    if (user === null)
        return res.status(400).send('Cannot find user. Please register first.');
    try {
        if (await bcrypt.compare(req.body.password, user.password))
            res.redirect('/index');
        else
            res.send('Failed to login')
    } catch { res.status(500).send(); }
});


//SERVER SET UP ON PORT 3000
app.listen(3000, function () {
    console.log("Server is running on port 3000");
});