//REQUIRING PACKAGES AND EXPRESS BASIC SET UP
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const ejs = require('ejs');

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));

//READING DATA FROM JSON
let rawdata = fs.readFileSync('cell_phone_data.json');
let data = JSON.parse(rawdata);

//VARIABLES AND DUMMY DB





//TESTING CODE







//GET REQUESTS HANDLING
app.get("/", function(req,res) {
  res.sendFile(__dirname + "/index.html");
});

app.get("/buyPc", function(req,res) {
  res.sendFile(__dirname + "/blank.html")
});

app.get("/buyCellphone", function(req,res) {
  res.render("cellphones", {
    cellphones: data
  });
});

//POST REQUESTS HANDLING






//SERVER SET UP ON PORT 3000
app.listen(3000, function() {
  console.log("Server is running on port 3000");
});
