//REQUIRING PACKAGES AND EXPRESS BASIC SET UP
const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const fs = require('fs');
const ejs = require('ejs');
const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(passport.initialize());

// LOGIN WITH FACEBOOK
var FACEBOOK_APP_ID = '1094660150915546';
var FACEBOOK_APP_SECRET = '8244fa995e24dcf0d0d6febed46b2156';
passport.use(new FacebookStrategy({
    clientID: FACEBOOK_APP_ID,
    clientSecret: FACEBOOK_APP_SECRET,
    callbackURL: 'http://localhost:3000/auth/facebook/callback'
},
    function (accessToken, refreshToken, profile, done) {
        console.log(profile);
        return done(null, profile);
        //User.findOrCreate({ facebookId: profile.id }, function (err, user) {
        //    return cb(err, user);
        //});
    }
));

//READING DATA FROM JSON
let rawdata = fs.readFileSync('cell_phone_data.json');
let data = JSON.parse(rawdata);

//VARIABLES AND DUMMY DB




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

// facebook redirections when loging in
app.get('/auth/facebook', passport.authenticate('facebook', { authType: 'reauthenticate', scope: ['email'] }));
app.get('/auth/facebook/callback', passport.authenticate('facebook', { successRedirect: '/updatePassword', failureRedirect: '/', session: false }));


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








//SERVER SET UP ON PORT 8080
app.listen(3000, function () {
    console.log("Server is running on port 3000");
});
