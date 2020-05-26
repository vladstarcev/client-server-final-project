//REQUIRING PACKAGES AND EXPRESS BASIC SET UP
const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const fs = require('fs');
const ejs = require('ejs');

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(bodyParser.json());

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
