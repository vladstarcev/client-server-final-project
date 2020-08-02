//REQUIRING PACKAGES AND EXPRESS BASIC SET UP
const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');
const bodyParser = require('body-parser');
const fs = require('fs');
const ejs = require('ejs');
const bcrypt = require('bcrypt');
const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const nodemailer = require('nodemailer');
const async = require('async');
const crypto = require('crypto');
const https = require('https');
const {
    Client
} = require('pg');

const app = express();
const saltRounds = 10;
const sizeOfRandomBytes = 20;

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(passport.initialize());
app.use(passport.session());
app.use(cookieParser('secret'));
app.use(session({
    secret: 'secret',
    cookie: { maxAge: 60000 },
    resave: false,
    saveUninitialized: false
}));
app.use(flash());
require('dotenv').config();


// VARIABLES AND DUMMY DB
var transactions = [];
var usersBeforeConfirmation = [];
var resetPasswordRequests = [];
var promoCodes = [{
    id: 1,
    promoCode: '3XCRt',
    description: '10% discount'
},
{
    id: 2,
    promoCode: '4DFG',
    description: 'My desc.'
},
{
    id: 3,
    promoCode: '6DSQW',
    description: 'My new description.'
}
];
var temp_user;

// LOGIN WITH FACEBOOK
passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: 'http://localhost:3000/auth/facebook/callback',
    //callbackURL: 'http://localhost:3000/main',
    profileFields: ['emails', 'name']
},
    function (accessToken, refreshToken, profile, done) {
        const client = new Client({
            user: process.env.POSTGRES_USER,
            password: process.env.POSTGRES_PASSWORD,
            host: process.env.POSTGRES_HOST,
            database: process.env.POSTGRES_DATABASE,
            port: process.env.POSTGRES_PORT
        });
        const query_string = 'SELECT * FROM "Users" WHERE "Email"=$1';
        const values = [profile.emails[0].value];

        client.connect();
        client.query(query_string, values, (err, result) => {
            if (err) {
                console.log(err);
            }
            if (result.rows.length) {
                //USER IS ALREADY REGISTERED
                console.log("This user is registered: ", result.rows);

                temp_user = {
                    username: profile.emails[0].value,
                    firstname: profile.name.givenName,
                    lastname: profile.name.familyName,
                    purchases: [0, 0, 0, 0],
                    rememberMe: true
                }

                const query_string2 = 'SELECT * FROM "Transactions" WHERE "User"=$1';
                const values2 = [profile.emails[0].value];

                client.query(query_string2, values2, (err, result2) => {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log("Transactions selected");
                        console.log(result2.rows);
                        result2.rows.forEach(item => {
                            if (item.Product == "iPhone X") temp_user.purchases[0]++;
                            if (item.Product == "iPhone 7") temp_user.purchases[1]++;
                            if (item.Product == "Samsung S8") temp_user.purchases[2]++;
                            if (item.Product == "Huawei P10") temp_user.purchases[3]++;
                        });
                        console.log(temp_user.purchases);
                    }
                    client.end();
                    return done(null, temp_user);
                });
            } else {
                //USER IS NOT REGISTERED
                console.log("This user is not registered");
                temp_user = {
                    username: profile.emails[0].value,
                    firstname: profile.name.givenName,
                    lastname: profile.name.familyName,
                    purchases: [0, 0, 0, 0],
                    rememberMe: true
                }

                bcrypt.hash(profile.id, saltRounds, function (err, hash) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log("Im in register via facebook");
                        const query_string3 = 'INSERT INTO "Users" ("Name", "FamilyName", "Email", "Password") VALUES ($1, $2, $3, $4)';
                        const values3 = [profile.name.givenName, profile.name.familyName, profile.emails[0].value, hash];

                        client.query(query_string3, values3, (err, result3) => {
                            console.log(result3);
                            client.end();
                            return done(null, temp_user);
                        });
                    }
                });
            }
        });
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
    if (temp_user && temp_user.rememberMe) {
        res.redirect('main');
    } else {
        res.render("login", {
            recaptchaSiteKey: process.env.RECAPTCHA_SECRET_KEY_CLIENT,
            message: req.flash('message')
        });
    }
});

app.get("/forgotPassword", function (req, res) {
    res.render("forgot-password", { recaptchaSiteKey: process.env.RECAPTCHA_SECRET_KEY_CLIENT });
});

// app.get("/register", function (req, res) {
//     res.sendFile(__dirname + "/register.html");
// });
app.get("/register", function (req, res) {
    res.render("register", {
        recaptchaSiteKey: process.env.RECAPTCHA_SECRET_KEY_CLIENT,
        message: req.flash('message')
    });
});

// app.get('/index', function(req, res) {
//   res.sendFile(__dirname + '/index.html');
// });

app.get("/buyPc", function (req, res) {
    res.render("buyPc", {
        cellphones: data,
        user: temp_user
    });
});

app.get("/buyCellphone", function (req, res) {
    res.render("cellphones", {
        cellphones: data,
        user: temp_user
    });
});

app.get("/pconfirm", function (req, res) {
    res.render("pconfirm", {
        cellphones: data,
        user: temp_user
    });
});

app.get("/profile", function (req, res) {
    const myclient = new Client({
        user: process.env.POSTGRES_USER,
        password: process.env.POSTGRES_PASSWORD,
        host: 'localhost',
        database: process.env.POSTGRES_DATABASE,
        port: process.env.POSTGRES_PORT
    });
    const query_string = 'SELECT * FROM "Users" WHERE "Email"=$1';
    const values = [temp_user.username];
    console.log("Temp User: ", temp_user.username);

    myclient.connect();
    myclient.query(query_string, values, (err, result) => {
        if (err) {
            console.log("Error occured");
            console.log(err);
        } else {
            console.log("This is profile route: ", result.rows);
        }
        const user = {
            firstName: result.rows[0].Name,
            lastName: result.rows[0].FamilyName
        }
        res.render("profile", {
            cellphones: data,
            user: temp_user,
            data: result.rows[0]
        });
        myclient.end();
    });

});

app.get("/about", function (req, res) {
    res.render("about", {
        cellphones: data,
        user: temp_user
    });
});

// password reset page after user clicks on link at mail
app.get('/reset/:token', function (req, res) {
    var resetRequest = resetPasswordRequests.find(request => request.resetPasswordToken === req.params.token);
    if (!resetRequest) {
        console.log('Password reset token is invalid.');
        return res.redirect('/forgotPassword');
    } else if (resetRequest.resetPasswordExpires < Date.now()) {
        console.log('Password reset token has expired.');
        return res.redirect('/forgotPassword');
    }

    res.render('reset', { token: req.params.token });
});

// creation of registered user after he clicks on link at mail
app.get('/confirmation/:token', async function (req, res) {
    var user = usersBeforeConfirmation.find(user => user.confirmationToken === req.params.token);
    if (!user) {
        console.log('Confirmation token is invalid.');
        return res.redirect('/');
    } else if (user.confirmationTokenExpires < Date.now()) {
        console.log('Confirmation token has expired.');
        return res.redirect('/');
    }

    // register user to data base
    try {
        var salt = await bcrypt.genSalt();
        var hashedPassword = await bcrypt.hash(user.password, salt);

        const client = new Client({
            user: process.env.POSTGRES_USER,
            password: process.env.POSTGRES_PASSWORD,
            host: process.env.POSTGRES_HOST,
            database: process.env.POSTGRES_DATABASE,
            port: process.env.POSTGRES_PORT
        });
        const query_string = 'INSERT INTO "Users" ("Name", "FamilyName", "Email", "PromoCode", "Password") VALUES ($1, $2, $3, $4, $5)';
        const values = [user.firstName, user.lastName, user.email, user.promoCode, hashedPassword];

        client.connect();
        client.query(query_string, values, (err, res) => {
            console.log(err, res);
            client.end();
        });

        temp_user = {
            username: user.email,
            firstname: user.firstName,
            lastname: user.lastName,
            purchases: [0, 0, 0, 0],
            rememberMe: true
        }

        usersBeforeConfirmation = usersBeforeConfirmation.filter(userBeforeConfirmation => userBeforeConfirmation !== user); // remove the user from this dummy db
        res.redirect('/main');

    } catch {
        res.status(500).send();
    }
});

// facebook redirections when loging in
app.get('/auth/facebook', passport.authenticate('facebook', {
    authType: 'reauthenticate',
    scope: ['email']
}));

app.get('/auth/facebook/callback', passport.authenticate('facebook', {
    successRedirect: '/main',
    failureRedirect: '/'
}));

app.get("/logout", function (req, res) {
    temp_user = null;
    res.redirect("/");
});

app.get("/main", function (req, res) {
    if (temp_user) {
        res.render("main", {
            cellphones: data,
            user: temp_user
        });
    } else {
        res.redirect("/");
    }
});


//POST REQUESTS HANDLING
app.post("/verifyCaptcha", function (req, res) {
    // user didn't check the captcha
    var response = req.body.captcha;
    if (response === undefined || response === "" || response === null) {
        return res.json({
            "success": false,
            "message": "Captcha must be selected"
        });
    }

    // verification process
    const seceretKey = process.env.RECAPTCHA_SECRET_KEY_SERVER;
    const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${seceretKey}&response=${response}&remoteip=${req.connection.remoteAddress}`;
    request(verifyUrl, function (error, response, body) {
        body = JSON.parse(body);

        // verification failed
        if (body.success !== undefined && !body.success) {
            return res.json({
                "success": false,
                "message": "Failed captcha verification"
            });
        }

        // verification succeed
        return res.json({
            "success": true,
            "message": "Captcha verification succeed"
        });
    });
});

app.post("/register", function (req, res) {

    var messageWithType = [];

    const client = new Client({
        user: process.env.POSTGRES_USER,
        password: process.env.POSTGRES_PASSWORD,
        host: process.env.POSTGRES_HOST,
        database: process.env.POSTGRES_DATABASE,
        port: process.env.POSTGRES_PORT
    });
    const query_string = 'SELECT * FROM "Users" WHERE "Email"=$1';
    const values = [req.body.inputEmail];

    client.connect();
    client.query(query_string, values, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            if (result.rowCount != 0) {
                messageWithType = ['danger', 'This user already registered']
                req.flash('message', messageWithType)
                res.redirect('/register');
            } else {
                if (req.body.promoCode != '' && req.body.promoCode != null) {
                    //const promoCodeQuery = 'SELECT * FROM "PromoCode" WHERE "PromoCode"=$1';
                    //const promoCode = [req.body.promoCode];
                    //client.query(promoCodeQuery, promoCode, (err, result) => {
                    //    if (err) {
                    //        console.log(err);
                    //    } else {
                    //        if (result.rowCount == 0) {
                    //            messageWithType = ['danger', "Can't register you with wrong promo code.\nPlease fill in your details with correct promo code or without promo code at all."]
                    //            req.flash('message', messageWithType)
                    //            res.redirect('/register');
                    //            return;
                    //        }
                    //    }
                    //});
                    if (promoCodes.find(code => code.promoCode === req.body.promoCode) === undefined) {
                        messageWithType = ['danger', "Can't register you with wrong promo code.\nPlease fill in your details with correct promo code or without promo code at all."]
                        req.flash('message', messageWithType)
                        res.redirect('/register');
                        client.end();
                        return;
                    } else {
                        async.waterfall([
                            function (done) {
                                crypto.randomBytes(sizeOfRandomBytes, function (err, buf) {
                                    var token = buf.toString('hex');
                                    done(err, token);
                                });
                            },
                            function (token, done) {
                                var user = usersBeforeConfirmation.find(userNotInDB => userNotInDB.email === req.body.inputEmail);

                                user = {
                                    email: req.body.inputEmail,
                                    password: req.body.inputPassword,
                                    firstName: req.body.firstName,
                                    lastName: req.body.lastName,
                                    promoCode: req.body.promoCode,
                                    confirmationToken: token,
                                    confirmationTokenExpires: Date.now() + 3600000 * 24 // 24 hours
                                }

                                usersBeforeConfirmation.push(user);

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
                                    subject: 'Complete Registration',
                                    text: 'Please click on the following link to complete your registration process:\n\n' +
                                        'http://' + req.headers.host + '/confirmation/' + token + '\n\n'
                                };
                                smtpTransport.sendMail(mailOptions, function (err) {
                                    console.log('mail sent');
                                    done(err, 'done');
                                });
                            }
                        ], function (err) {
                            if (err)
                                return next(err);
                            res.redirect('/');
                        });

                        messageWithType = ['success', 'Please check your email to complete the registration process']
                        req.flash('message', messageWithType);
                        res.redirect('/');
                    }
                } else {
                    async.waterfall([
                        function (done) {
                            crypto.randomBytes(sizeOfRandomBytes, function (err, buf) {
                                var token = buf.toString('hex');
                                done(err, token);
                            });
                        },
                        function (token, done) {
                            var user = usersBeforeConfirmation.find(userNotInDB => userNotInDB.email === req.body.inputEmail);

                            user = {
                                email: req.body.inputEmail,
                                password: req.body.inputPassword,
                                firstName: req.body.firstName,
                                lastName: req.body.lastName,
                                promoCode: req.body.promoCode,
                                confirmationToken: token,
                                confirmationTokenExpires: Date.now() + 3600000 * 24 // 24 hours
                            }

                            usersBeforeConfirmation.push(user);

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
                                subject: 'Complete Registration',
                                text: 'Please click on the following link to complete your registration process:\n\n' +
                                    'http://' + req.headers.host + '/confirmation/' + token + '\n\n'
                            };
                            smtpTransport.sendMail(mailOptions, function (err) {
                                console.log('mail sent');
                                done(err, 'done');
                            });
                        }
                    ], function (err) {
                        if (err)
                            return next(err);
                        res.redirect('/');
                    });

                    messageWithType = ['success', 'Please check your email to complete the registration process']
                    req.flash('message', messageWithType);
                    res.redirect('/');
                }
            }
        }
        client.end();
    });
});

app.post('/updateDetails', function (req, res) {
    const client = new Client({
        user: process.env.POSTGRES_USER,
        password: process.env.POSTGRES_PASSWORD,
        host: process.env.POSTGRES_HOST,
        database: process.env.POSTGRES_DATABASE,
        port: process.env.POSTGRES_PORT
    });
    const query_string = 'UPDATE "Users" SET ("Name","FamilyName","PhoneNumber","Country","City","Street","ZipCode") = ($1,$2,$3,$4,$5,$6,$7) WHERE "Email"=$8';
    const values = [req.body.firstName, req.body.lastName, req.body.phone, req.body.country, req.body.city, req.body.street, req.body.zip, temp_user.username];

    client.connect();
    client.query(query_string, values, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            console.log(result);
            res.redirect("main");
        }
        client.end();
    });

    // send mail
    var smtpTransport = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: process.env.GMAIL_ADDRESS,
            pass: process.env.GMAIL_PASSWORD
        }
    });
    var mailOptions = {
        to: temp_user.username,
        from: process.env.GMAIL_ADDRESS,
        subject: 'Details Updated',
        text: 'Hello,\n\n' +
            'This is a confirmation that the details for your account ' + temp_user.username + ' has just been updated.\n'
    };
    smtpTransport.sendMail(mailOptions, function (err) { console.log('mail sent'); });
});

app.post('/login', function (req, res) {
    const client = new Client({
        user: process.env.POSTGRES_USER,
        password: process.env.POSTGRES_PASSWORD,
        host: process.env.POSTGRES_HOST,
        database: process.env.POSTGRES_DATABASE,
        port: process.env.POSTGRES_PORT
    });

    const query_string = 'SELECT * FROM "Users" WHERE "Email"=$1';
    const values = [req.body.email];

    client.connect();
    client.query(query_string, values, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            if (result.rowCount != 0) {
                if (req.body['rememberMe'] == undefined) {
                    temp_user = {
                        username: result.rows[0].Email,
                        firstname: result.rows[0].Name,
                        lastname: result.rows[0].FamilyName,
                        purchases: [0, 0, 0, 0],
                        rememberMe: false
                    }
                } else {
                    temp_user = {
                        username: result.rows[0].Email,
                        firstname: result.rows[0].Name,
                        lastname: result.rows[0].FamilyName,
                        purchases: [0, 0, 0, 0],
                        rememberMe: true
                    }
                }
                const query_string2 = 'SELECT * FROM "Transactions" WHERE "User"=$1';
                const values2 = [temp_user.username];

                client.query(query_string2, values2, (err, result2) => {
                    if (err) {
                        console.log(err);
                    } else {
                        result2.rows.forEach(item => {
                            if (item.Product == "iPhone X") temp_user.purchases[0]++;
                            if (item.Product == "iPhone 7") temp_user.purchases[1]++;
                            if (item.Product == "Samsung S8") temp_user.purchases[2]++;
                            if (item.Product == "Huawei P10") temp_user.purchases[3]++;
                        });
                    }
                    client.end();
                    bcrypt.compare(req.body.password, result.rows[0].Password).then((result) => {
                        if (result) {
                            console.log("authentication successful");
                            res.redirect("main");
                        } else {
                            var messageWithType = ['danger', 'Authentication failed. Wrong username or password.']
                            req.flash('message', messageWithType)
                            res.redirect('/');
                        }
                    })
                        .catch((err) => console.error(err))
                });
            } else {
                var messageWithType = ['danger', 'Authentication failed. Wrong username or password.']
                req.flash('message', messageWithType)
                res.redirect('/');
            }
        }
    });
});

app.post('/forgotPassword', function (req, res, next) {
    var messageWithType = [];

    const client = new Client({
        user: process.env.POSTGRES_USER,
        password: process.env.POSTGRES_PASSWORD,
        host: process.env.POSTGRES_HOST,
        database: process.env.POSTGRES_DATABASE,
        port: process.env.POSTGRES_PORT
    });

    const query_string = 'SELECT * FROM "Users" WHERE "Email"=$1';
    const values = [req.body.email];

    client.connect();
    client.query(query_string, values, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            if (result.rowCount == 0) {
                messageWithType = ['danger', 'No such user with such mail']
                req.flash('message', messageWithType)
                res.redirect('/');
                client.end();
                return;
            } else {
                async.waterfall([
                    function (done) {
                        crypto.randomBytes(sizeOfRandomBytes, function (err, buf) {
                            var token = buf.toString('hex');
                            done(err, token);
                        });
                    },
                    function (token, done) {
                        var user = { email: result.rows[0].Email }
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
                            subject: 'Password Reset',
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
                messageWithType = ['success', 'Please check your mail to complete your reset password process'];
                req.flash('message', messageWithType)
                res.redirect('/');
            }
            client.end();
        }
    });
});

app.post("/changePassword", function (req, res) {

    const client = new Client({
        user: process.env.POSTGRES_USER,
        password: process.env.POSTGRES_PASSWORD,
        host: process.env.POSTGRES_HOST,
        database: process.env.POSTGRES_DATABASE,
        port: process.env.POSTGRES_PORT
    });
    const query_string1 = 'SELECT * FROM "Users" WHERE "Email"=$1';
    const values1 = [temp_user.username];

    client.connect();
    client.query(query_string1, values1, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            console.log("user found");
            if (bcrypt.compare(req.body.oldPass, result.rows[0].Password)) {
                bcrypt.hash(req.body.newPass, saltRounds, function (err, hash) {
                    if (err) {
                        console.log(err);
                    } else {
                        const query_string2 = 'UPDATE "Users" SET "Password" = $1 WHERE "Email" = $2';
                        const values2 = [hash, temp_user.username];

                        client.query(query_string2, values2, (err, result2) => {
                            if (err) {
                                console.log(err);
                            } else {
                                console.log("password updated", result2);
                                res.redirect("main");
                            }
                            client.end();

                            // send mail
                            var smtpTransport = nodemailer.createTransport({
                                service: 'Gmail',
                                auth: {
                                    user: process.env.GMAIL_ADDRESS,
                                    pass: process.env.GMAIL_PASSWORD
                                }
                            });
                            var mailOptions = {
                                to: temp_user.username,
                                from: process.env.GMAIL_ADDRESS,
                                subject: 'Password Updated',
                                text: 'Hello,\n\n' +
                                    'This is a confirmation that the password for your account ' + temp_user.username + ' has just been updated.\n'
                            };
                            smtpTransport.sendMail(mailOptions, function (err) { console.log('mail sent'); });
                        });
                    }
                });
            }
        }
    });
});

app.post('/reset/:token', async function (req, res) {
    var resetRequest = resetPasswordRequests.find(request => request.resetPasswordToken === req.params.token);
    async.waterfall([
        function (done) {
            if (!resetRequest) {
                console.log('Password reset token is invalid.');
                return res.redirect('/login');
            } else if (resetRequest.resetPasswordExpires < Date.now()) {
                console.log('Password reset token has expired.');
                return res.redirect('/login');
            }

            if (req.body.password === req.body.confirm) {
                resetPasswordRequests = resetPasswordRequests.filter(request => request !== resetRequest); // remove the request
                var user = { email: resetRequest.email };
                done(null, user);
            } else {
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
                console.log('Success! Password has been changed.');
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

        // update in data base
        const client = new Client({
            user: process.env.POSTGRES_USER,
            password: process.env.POSTGRES_PASSWORD,
            host: process.env.POSTGRES_HOST,
            database: process.env.POSTGRES_DATABASE,
            port: process.env.POSTGRES_PORT
        });
        const select_user_query_string = 'SELECT * FROM "Users" WHERE "Email"=$1';
        var values = [resetRequest.email];

        client.connect();
        client.query(select_user_query_string, values, (err, result) => {
            if (err) {
                console.log(err);
            } else {
                temp_user = {
                    username: result.rows[0].Email,
                    firstname: result.rows[0].Name,
                    lastname: result.rows[0].FamilyName,
                    purchases: [0, 0, 0, 0],
                    rememberMe: true
                }

                const select_transaction_query_string = 'SELECT * FROM "Transactions" WHERE "User"=$1';
                client.query(select_transaction_query_string, values, (err, result2) => {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log("Transactions selected");
                        console.log(result2.rows);
                        result2.rows.forEach(item => {
                            if (item.Product == "iPhone X") temp_user.purchases[0]++;
                            if (item.Product == "iPhone 7") temp_user.purchases[1]++;
                            if (item.Product == "Samsung S8") temp_user.purchases[2]++;
                            if (item.Product == "Huawei P10") temp_user.purchases[3]++;
                        });
                        console.log(temp_user.purchases);
                    }

                    const update_query_string = 'UPDATE "Users" SET "Password" = $1 WHERE "Email" = $2';
                    values = [hashedPassword, resetRequest.email];
                    client.query(update_query_string, values, (err, result) => {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log("password updated", result);
                            client.end();
                            res.redirect('/main');
                        }
                    });
                });
            }
        });
    } catch {
        res.status(500).send();
    }
});

app.post("/buyCellphone", function (req, res) {
    const client = new Client({
        user: process.env.POSTGRES_USER,
        password: process.env.POSTGRES_PASSWORD,
        host: process.env.POSTGRES_HOST,
        database: process.env.POSTGRES_DATABASE,
        port: process.env.POSTGRES_PORT
    });

    var userInput = {
        phone: req.body.phone,
        model: req.body.model,
        price: data[req.body.phone].models[req.body.model].price,
        number: req.body.card_number,
        name: req.body.card_name,
        month: req.body.card_month,
        year: req.body.card_year,
        cvv: req.body.card_cvv
    };
    var date = new Date();
    var dateString = date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();

    const url = "https://api.exchangeratesapi.io/latest?base=USD&symbols=ILS";
    https.get(url, function (response) {
        response.on("data", function (d) {
            const rate = JSON.parse(d);
            const exchangeRate = rate.rates.ILS;
            var lp = Number(userInput.price.slice(0, userInput.price.length - 1)) * exchangeRate;
            var tp = lp + lp * 17 / 100;
            var t = {
                product: data[userInput.phone].id,
                model: data[userInput.phone].models[userInput.model].type,
                date: dateString,
                user: temp_user.username,
                price: userInput.price,
                local_price: lp + "ILS",
                total_price: tp + "ILS",
                number: userInput.number,
                name: userInput.name,
                exp_date: userInput.month + '/' + userInput.year,
                cvv: userInput.cvv
            };
            const query_string = 'INSERT INTO "Transactions" ("Product","Model","Date","User","Price","LocalPrice","TotalPriceIncludingVAT","Number","Name","ExpDate","CVV") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)';
            const values = [t.product, t.model, t.date, t.user, t.price, t.local_price, t.total_price, t.number, t.name, t.exp_date, t.cvv];
            temp_user.purchases[req.body.phone]++;

            client.connect();
            client.query(query_string, values, (err, res) => {
                console.log(err, res);
                client.end();

            });
            res.redirect("pconfirm");

        });
    });
});


//SERVER SET UP ON PORT 3000
const port = process.env.PORT || 3000;
app.listen(port, function () {
    console.log("Server is running on port 3000");
});
