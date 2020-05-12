//REQUIRING PACKAGES AND EXPRESS BASIC SET UP
const express = require('express');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));

//VARIABLES AND DUMMY DB






//GET REQUESTS HANDLING
app.get("/", function(req,res) {
  res.sendFile(__dirname + "/index.html");
});

app.get("/buyPc", function(req,res) {
  res.sendFile(__dirname + "/blank.html")
});



//POST REQUESTS HANDLING






//SERVER SET UP ON PORT 3000
app.listen(3000, function() {
  console.log("Server is running on port 3000");
});
