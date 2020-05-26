//REQUIRING PACKAGES AND EXPRESS BASIC SET UP
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const ejs = require('ejs');

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

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









//SERVER SET UP ON PORT 8080
app.listen(8080, function () {
    console.log("Server is running on port 8080");
});
