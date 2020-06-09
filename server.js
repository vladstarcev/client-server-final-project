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
const https = require('https');
const {Client} = require('pg');

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(passport.initialize());
app.use(passport.session());
require('dotenv').config();


// VARIABLES AND DUMMY DB
var transactions = [];
var purchases = [0, 0, 0, 0];
var users = [];
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
var temp_user = {
  username: "Barak Obama",
  password: "123",
  firstName: "Barak",
  lastName: "Obama",
  phone: "123456",
  country: "USA",
  email: "bobama@gmail.com",
  city: "New York",
  street: "Palm Street",
  zip: "123456"
}

//CREATING POSTGRES CLIENT
const client = new Client({
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  host: 'localhost',
  database: process.env.POSTGRES_DATABASE,
  port: process.env.POSTGRES_PORT
});

// LOGIN WITH FACEBOOK
passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: 'http://localhost:3000/auth/facebook/callback',
    profileFields: ['emails', 'name']
  },
  function(accessToken, refreshToken, profile, done) {
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

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});


//READING DATA FROM JSON
let rawdata = fs.readFileSync('cell_phone_data.json');
let data = JSON.parse(rawdata);





//GET REQUESTS HANDLING
app.get("/", function(req, res) {
  res.render("login");
});

app.get("/forgotPassword", function(req, res) {
  res.render("forgot-password");
});

// app.get("/register", function (req, res) {
//     res.sendFile(__dirname + "/register.html");
// });
app.get("/register", function(req, res) {
  res.render("register");
});

// app.get('/index', function(req, res) {
//   res.sendFile(__dirname + '/index.html');
// });

app.get("/buyPc", function(req, res) {
  res.render("buyPc", {
    cellphones: data,
    purchases: purchases,
    user: temp_user
  });
});

app.get("/buyCellphone", function(req, res) {
  res.render("cellphones", {
    cellphones: data,
    purchases: purchases,
    user: temp_user
  });
});

app.get("/pconfirm", function(req, res) {
  res.render("pconfirm", {
    cellphones: data,
    purchases: purchases,
    user: temp_user
  });
});

app.get("/profile", function(req, res) {
  res.render("profile", {
    cellphones: data,
    purchases: purchases,
    user: temp_user
  });
});
app.get("/about", function(req, res) {
  res.render("about", {
    cellphones: data,
    purchases: purchases,
    user: temp_user
  });
});

app.get('/reset/:token', function(req, res) {
  var resetRequest = resetPasswordRequests.find(request => request.resetPasswordToken === req.params.token);
  if (!resetRequest) {
    console.log('Password reset token is invalid.');
    return res.redirect('/forgotPassword');
  } else if (resetRequest.resetPasswordExpires < Date.now()) {
    console.log('Password reset token has expired.');
    return res.redirect('/forgotPassword');
  }

  res.render('reset', {
    token: req.params.token
  });
});

// facebook redirections when loging in
app.get('/auth/facebook', passport.authenticate('facebook', {
  authType: 'reauthenticate',
  scope: ['email']
}));
app.get('/auth/facebook/callback', passport.authenticate('facebook', {
  successRedirect: '/index',
  failureRedirect: '/'
}));


//POST REQUESTS HANDLING
app.post("/verifyCaptcha", function(req, res) {
  // user didn't check the captcha
  var response = req.body.captcha;
  if (response === undefined || response === "" || response === null) {
    return res.json({
      "success": false,
      "message": "Captcha must be selected"
    });
  }

  // verification process
  const seceretKey = process.env.RECAPTCHA_SECRET_KEY;
  const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${seceretKey}&response=${response}&remoteip=${req.connection.remoteAddress}`;
  request(verifyUrl, function(error, response, body) {
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

app.post("/register", async function(req, res) {
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

    if (!users.some(e => e.email === user.email) && (promoCodes.some(e => e.promoCode === user.promoCode) || user.promoCode === '' || user.promoCode === null)) {
      //users.push(user);
      const query_string = 'INSERT INTO "Users" ("Name", "FamilyName", "Email", "PromoCode", "Password") VALUES ($1, $2, $3, $4, $5)';
      const values = [user.firstName, user.lastName, user.email, user.promoCode, hashedPassword];

      client.connect();
      client.query(query_string, values, (err, res) => {
        console.log(err, res);
        client.end();
      });
    }


    console.log(users);

    //res.redirect("/index")
    res.render("main", {
      cellphones: data,
      purchases: purchases,
      user: user
    });
  } catch {
    res.status(500).send();
  }
});

app.post('/login', async function(req, res) {

  const query_string = 'SELECT * FROM "Users" WHERE "Email"=$1';
  const values = [req.body.email];

  client.connect();
  client.query(query_string, values, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      console.log(result.rows);
      const user = {
        firstName: result.rows[0].Name,
        lastName: result.rows[0].FamilyName,
        email: result.rows[0].Email,
        password: result.rows[0].Password
      }

      if (await bcrypt.compare(req.body.password, user.password)) {
        res.render("main", {
          cellphones: data,
          purchases: purchases,
          user: user
        });
      } else
        res.send('Failed to login')
    }
    client.end();
  });

  // var user = users.find(user => user.email === req.body.email);
  // if (user === null)
  //   return res.status(400).send('Cannot find user. Please register first.');
  // try {
  //   if (await bcrypt.compare(req.body.password, user.password))
  //     res.render("main", {
  //       cellphones: data,
  //       purchases: purchases,
  //       user: user
  //     });
  //   else
  //     res.send('Failed to login')
  // } catch {
  //   res.status(500).send();
  // }
});

app.post('/forgotPassword', function(req, res, next) {
  async.waterfall([
    function(done) {
      crypto.randomBytes(20, function(err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    function(token, done) {
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
    function(token, user, done) {
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
      smtpTransport.sendMail(mailOptions, function(err) {
        console.log('mail sent');
        done(err, 'done');
      });
    }
  ], function(err) {
    if (err)
      return next(err);
    res.redirect('/forgotPassword');
  });
  res.redirect('/');
});

app.post('/reset/:token', async function(req, res) {
  var resetRequest = resetPasswordRequests.find(request => request.resetPasswordToken === req.params.token);
  async.waterfall([
    function(done) {
      if (!resetRequest) {
        console.log('Password reset token is invalid.');
        return res.redirect('/login');
      } else if (resetRequest.resetPasswordExpires < Date.now()) {
        console.log('Password reset token has expired.');
        return res.redirect('/login');
      }

      if (req.body.password === req.body.confirm) {
        resetPasswordRequests = resetPasswordRequests.filter(request => request !== resetRequest); // remove the request
        var user = users.find(user => user.email === resetRequest.email);
        done(null, user);
      } else {
        console.log("Passwords do not match.");
        return res.redirect('/login');;
      }
    },
    function(user, done) {
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
      smtpTransport.sendMail(mailOptions, function(err) {
        console.log('Success! Your password has been changed.');
        done(err);
      });
    }
  ], function(err) {
    res.redirect('/login');
  });
  try {
    // generate new encrypted password
    var salt = await bcrypt.genSalt();
    var hashedPassword = await bcrypt.hash(req.body.password, salt);
    var indexOfUser = users.findIndex(user => user.email === resetRequest.email);
    users[indexOfUser].password = hashedPassword;
    res.redirect('/index');
  } catch {
    res.status(500).send();
  }
});

app.post("/buyCellphone", function(req, res) {
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
  https.get(url, function(response) {
    response.on("data", function(d) {
      const rate = JSON.parse(d);
      const exchangeRate = rate.rates.ILS;
      var lp = Number(userInput.price.slice(0, userInput.price.length - 1)) * exchangeRate;
      var tp = lp + lp * 17 / 100;
      var t = {
        id: (transactions.length + 1),
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
        cvv: userInput.cvv,
        memo: ""
      };
      const query_string = "INSERT INTO transactions VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)";
      const values = [t.id, t.product, t.model, t.date, t.user, t.price, t.local_price, t.total_price, t.number, t.name, t.exp_date, t.cvv, t.memo];
      transactions.push(t);
      purchases[req.body.phone]++;

      console.log(transactions);
      console.log(purchases);

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
app.listen(3000, function() {
  console.log("Server is running on port 3000");
});
