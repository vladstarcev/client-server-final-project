//REQUIRING PACKAGES AND EXPRESS BASIC SET UP
const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const fs = require('fs');
const ejs = require('ejs');
const bcrypt = require('bcrypt');
const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const nodemailer = require('nodemailer');
const async = require('async');
const crypto = require('crypto');

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(passport.initialize());
app.use(passport.session());
require('dotenv').config();


// VARIABLES AND DUMMY DB
var users = [];
var resetPasswordRequests = [];
var promoCodes = [
    { id: 1, promoCode: '3XCRt', description: '10% discount' },
    { id: 2, promoCode: '4DFG', description: 'My desc.' },
    { id: 3, promoCode: '6DSQW', description: 'My new description.' }
];


// LOGIN WITH FACEBOOK
passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
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

app.get('/index', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

app.get('/reset/:token', function (req, res) {
    var resetRequest = resetPasswordRequests.find(request => request.resetPasswordToken === req.params.token);
    if (!resetRequest) {
        console.log('Password reset token is invalid.');
        return res.redirect('/forgotPassword');
    }
    else if (resetRequest.resetPasswordExpires < Date.now()) {
        console.log('Password reset token has expired.');
        return res.redirect('/forgotPassword');
    }

    res.render('reset', { token: req.params.token });
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
    const seceretKey = process.env.RECAPTCHA_SECRET_KEY;
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

app.post("/register", async function (req, res) {
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

        console.log(users);

        res.redirect("/index")
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

app.post('/forgotPassword', function (req, res, next) {
    async.waterfall([
        function (done) {
            crypto.randomBytes(20, function (err, buf) {
                var token = buf.toString('hex');
                done(err, token);
            });
        },
        function (token, done) {
            var user = users.find(user => user.email === req.body.email);
            if (!user) {
                console.log('No such user with such mail');
                return res.redirect('/forgotPassword');
            }

            resetPasswordRequests.push({
                email: user.email,
                resetPasswordToken: token,
                resetPasswordExpires: Date.now() + 3600000 // 1 hour
            });

            done(null, token, user);
        },
        function (token, user, done) {
            var smtpTransport = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: process.env.GMAIL_ADDRESS,
                    pass: process.env.GMAIL_PASSWORD
                }
            });
            var mailOptions = {
                to: user.email,
                from: process.env.GMAIL_ADDRESS,
                subject: 'Password Reset - Cellphones and Copmuters',
                text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                    'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                    'http://' + req.headers.host + '/reset/' + token + '\n\n' +
                    'If you did not request this, please ignore this email and your password will remain unchanged.\n'
            };
            smtpTransport.sendMail(mailOptions, function (err) {
                console.log('mail sent');
                done(err, 'done');
            });
        }
    ], function (err) {
        if (err)
            return next(err);
        res.redirect('/forgotPassword');
    });
    res.redirect('/');
});

app.post('/reset/:token', async function (req, res) {
    var resetRequest = resetPasswordRequests.find(request => request.resetPasswordToken === req.params.token);
    async.waterfall([
        function (done) {
            if (!resetRequest) {
                console.log('Password reset token is invalid.');
                return res.redirect('/login');
            }
            else if (resetRequest.resetPasswordExpires < Date.now()) {
                console.log('Password reset token has expired.');
                return res.redirect('/login');
            }

            if (req.body.password === req.body.confirm) {
                resetPasswordRequests = resetPasswordRequests.filter(request => request !== resetRequest); // remove the request
                var user = users.find(user => user.email === resetRequest.email);
                done(null, user);
            }
            else {
                console.log("Passwords do not match.");
                return res.redirect('/login');;
            }
        },
        function (user, done) {
            console.log(user);
            var smtpTransport = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: process.env.GMAIL_ADDRESS,
                    pass: process.env.GMAIL_PASSWORD
                }
            });
            var mailOptions = {
                to: user.email,
                from: process.env.GMAIL_ADDRESS,
                subject: 'Your password has been changed',
                text: 'Hello,\n\n' +
                    'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
            };
            smtpTransport.sendMail(mailOptions, function (err) {
                console.log('Success! Your password has been changed.');
                done(err);
            });
        }
    ], function (err) {
        res.redirect('/login');
    });
    try {
        // generate new encrypted password
        var salt = await bcrypt.genSalt();
        var hashedPassword = await bcrypt.hash(req.body.password, salt);
        var indexOfUser = users.findIndex(user => user.email === resetRequest.email);
        users[indexOfUser].password = hashedPassword;
        res.redirect('/index');
    } catch{ res.status(500).send(); }  
});


//SERVER SET UP ON PORT 3000
app.listen(3000, function () {
    console.log("Server is running on port 3000");
});