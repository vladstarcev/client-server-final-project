//REQUIRING PACKAGES AND EXPRESS BASIC SET UP
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const ejs = require('ejs');
const https = require('https');

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static('public'));

//READING DATA FROM JSON
let rawdata = fs.readFileSync('cell_phone_data.json');
let data = JSON.parse(rawdata);

//VARIABLES AND DUMMY DB
var transactions = [];
var purchases = [0, 0, 0, 0];



//TESTING CODE







//GET REQUESTS HANDLING
app.get("/", function(req, res) {
  res.render("main", {
    cellphones: data,
    purchases: purchases
  });
});

app.get("/buyPc", function(req, res) {
  res.render("buyPc", {
    cellphones: data,
    purchases: purchases
  });
});

app.get("/buyCellphone", function(req, res) {
  res.render("cellphones", {
    cellphones: data,
    purchases: purchases
  });
});

app.get("/pconfirm", function(req, res) {
  res.render("pconfirm", {
    cellphones: data,
    purchases: purchases
  });
});

//POST REQUESTS HANDLING
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
  console.log(userInput);
  var date = new Date();
  var dateString = date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();

  const url = "https://api.exchangeratesapi.io/latest?base=USD&symbols=ILS";
  https.get(url, function(response) {
    response.on("data", function(d) {
      const rate = JSON.parse(d);
      const exchangeRate = rate.rates.ILS;
      var lp = Number(userInput.price.slice(0, userInput.price.length - 1)) * exchangeRate;
      var tp = lp + lp * 17 / 100;
      console.log(exchangeRate, lp, tp);
      var t = {
        id: (transactions.length + 1),
        product: data[userInput.phone].id,
        model: data[userInput.phone].models[userInput.model].type,
        date: dateString,
        user: "Valerie Luna",
        price: userInput.price,
        local_price: lp + "ILS",
        total_price: tp + "ILS",
        number: userInput.number,
        name: userInput.name,
        exp_date: userInput.month + '/' + userInput.year,
        cvv: userInput.cvv,
        memo: ""
      };

      transactions.push(t);
      purchases[req.body.phone]++;

      console.log(transactions);
      console.log(purchases);
      res.redirect("pconfirm");
    });
  });
});

//FUNCTIONS




//SERVER SET UP ON PORT 3000
app.listen(3000, function() {
  console.log("Server is running on port 3000");
});
