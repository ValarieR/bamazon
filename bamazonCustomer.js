var mysql = require("mysql");
var inquirer = require("inquirer");
var chalk = require('chalk');
var Table = require('cli-table');
var keys = require('./keys.js');

// establish connection
var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: keys,
  database: "bamazonDB"
});

// connection varification
connection.connect(function(err) {
  if (err) throw err;
  console.log(chalk.hidden("connected"));

  displayItems();
});

// instruction 5, welcoming the user and displaying initial products
function displayItems() {
  connection.query("SELECT * FROM products", function(err, response) {
    if (err) throw err;
    var table = new Table({
      chars: {
        'top': '═',
        'top-mid': '╤',
        'top-left': '╔',
        'top-right': '╗',
        'bottom': '═',
        'bottom-mid': '╧',
        'bottom-left': '╚',
        'bottom-right': '╝',
        'left': '║',
        'left-mid': '╟',
        'mid': '─',
        'mid-mid': '┼',
        'right': '║',
        'right-mid': '╢',
        'middle': '│'
      },
      head: ['Id', 'Name', 'Price', '# In Stock']
    });

    for (var i = 0; i < response.length; i++) {
      table.push([response[i].id, response[i].product_name, '$' + response[
        i].price, response[i].stock_quantity]);
    }
    console.log(chalk.bold.yellowBright('Welcome to Bamazon!'));
    console.log(table.toString());
    console.log("======================");
    idAmountDesired();
  });
}

// function to ask the id of the product they want to purchase
function idAmountDesired() {
  inquirer.prompt([
      // instruction 6 - id and how many of item wanted
      {
        name: "id",
        type: "input",
        message: "What is the id number of the item you'd like to purchase?",
        validate: function(value) {
          var re = /^\d+$/;
          return re.test(value) || "Please enter a number."
        }
      }, {
        name: "amount",
        type: "input",
        message: "How many would you like?",
        validate: function(value) {
          var re = /^\d+$/;
          return re.test(value) || "Please enter a number."
        },
        default: 1
      }
    ])
    .then(function(answer) {
      connection.query("SELECT * FROM products where ?", {
        id: answer.id
      }, function(err, response) {
        if (err) throw err;
        //instruction 7 - check availability based on stock
        if (response[0].stock_quantity >= answer.amount) {
          console.log(chalk.bold.cyanBright.bgWhite("It's yours!"));

          var newInStock = response[0].stock_quantity - parseInt(answer.amount);

          function updateStock(id, amount) {
            connection.query("UPDATE products set ? where ?", [{
              stock_quantity: amount
            }, {
              id: id
            }], function(err, response) {

            });
          }
          updateStock(answer.id, newInStock);

          var totalPrice = parseInt(answer.amount) * response[0].price;

          console.log(chalk.magenta("Total Sale Amount: ") + totalPrice);
          buyAgain();
        } else {
          console.log("We're sorry. Insufficent stock for this purchase.");
          idAmountDesired();
        }
      });
    });
}

// function to start the process over
function buyAgain() {
  inquirer.prompt([{
      type: 'confirm',
      name: 'buyMore',
      message: "Would you like to purchase more items?"
    }])
    .then(function(answer) {
      if (answer.buyMore === true) {
        idAmountDesired();
      } else {
        console.log("Thank you for your business. Have a great day!");
        connection.end();
      }
    });
}
