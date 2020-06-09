//REQUIRING PACKAGES AND EXPRESS BASIC SET UP
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const ejs = require('ejs');
const https = require('https');
const {Client} = require('pg');

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
  user: 'postgres',
  password: '123',
  host: 'localhost',
  database: 'postgres',
  port: 5432
});

//TESTING CODE







//GET REQUESTS HANDLING
app.get("/", function(req, res) {
  res.render("main", {
    cellphones: data,
    purchases: purchases,
    user: temp_user
  });
});

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

//FUNCTIONS




//SERVER SET UP ON PORT 3000
app.listen(3000, function() {
  console.log("Server is running on port 3000");
});
