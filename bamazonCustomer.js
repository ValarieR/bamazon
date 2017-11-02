var mysql = require("mysql");
var inquirer = require("inquirer");
var chalk = require('chalk');
var Table = require('cli-table');

// establish connection
var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "TechPass17!",
  database: "bamazonDB"
});

// connection varification
connection.connect(function (err) {
  if (err) throw err;
  console.log("connected");
  //connection.end();
  displayItems();
});

function displayItems() {
  connection.query("SELECT * FROM products", function (err, response) {
    if (err) throw err;
    var table = new Table({
      chars: {
                'top': '═', 'top-mid': '╤', 'top-left': '╔', 'top-right': '╗'
                , 'bottom': '═', 'bottom-mid': '╧', 'bottom-left': '╚', 'bottom-right': '╝'
                , 'left': '║', 'left-mid': '╟', 'mid': '─', 'mid-mid': '┼'
                , 'right': '║', 'right-mid': '╢', 'middle': '│'
            },
      head: ['Id', 'Name', 'Price']
    });

    for (var i = 0; i < response.length; i++) {
      table.push([response[i].id, response[i].product_name, '$' + response[i].price]);
    }
    console.log("Welcome to Bam!-azon");
    console.log(table.toString());
  });
}
