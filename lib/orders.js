var _data = require('./data')
var _tokens = require('./tokens')
var _pizzas = require('./pizzaList')

var qs = require("querystring");
var http = require("https");

var options = {
  "method": "POST",
  "hostname": "api.stripe.com",
  "path": "/v1/charges",
  "auth": "sk_test_51W2Y1mJmiAoWiZd12evQ1Y3:",
  "headers": {
    "cache-control": "no-cache",
    "Postman-Token": "7b52c030-58b6-45ee-8c3e-ceb56a90bc2f"
  }
};

var req = http.request(options, function (res) {
  var chunks = []

  res.on("data", function (chunk) {
    chunks.push(chunk)
  })

  res.on("end", function () {
    var body = Buffer.concat(chunks)
    console.log(body.toString())
  })
})

var orders = {}

// 1- read the cart of a client with all orders with all the orders
// 3-  post a order whith the total price
// 4 - if it was approved, them clean the card
// Everything is done synchronous
// 1 - the order closes all demands that are in the cart

function getCartFromClient (clientName, httpResponse) {
  // Check the token
  _data.read('cart', clientName, (err, userData) => {
    if (!err) {
      _pizzas.pizzaDictionary((_err, pizzaData) => {
        if (!_err) {
          console.log(pizzaData)
          // create the dictionary with the list of pizzas
          let pizzaDict = {}
          for (var i = 0; i < pizzaData.pizzas.length; i++) {
            pizzaDict[pizzaData.pizzas[i].name] = pizzaData.pizzas[i].price
          }
          // load the cart and calculate the total
          let total = 0
          for (i = 0; i < userData.orders.length; i++) {
            total += userData.orders[i].quantity * pizzaDict[userData.orders[i].name]
            console.log('order: ', userData.orders[i])
          }
          console.log('total :' + total)
          // send the order 

          // if approved,
          // 1- create the order object with the information.
          // 2- Clean the cart
          req.write(qs.stringify({
            amount: total*100,
            currency: 'eur',
            source: 'tok_mastercard',
            description: 'Charge for boubounio@example.com'
          }))

          req.end()

          // send the order object back to the client
          httpResponse(200)
        } else {
          httpResponse(400, {
            'Error': 'couldn\'t read pizza List'
          })
        }
      })
    } else {
      httpResponse(400, {
        'Error': 'couldn\'t read cart'
      })
    }
  })
}

orders.post = function (context, httpResponse) {
  var query = context['queryString']

  // Get token from headers
  var token = typeof (context.headers.token) === 'string' ? context.headers.token : false

  // Verify that the given token is valid for the phone number
  _tokens.verifyToken(token, query.user, function (tokenIsValid) {
    if (tokenIsValid) {
      // Payload : pizza name , quantity
      var name = typeof (query.user) === 'string' && query.user.trim().length > 0 ? query.user.trim() : false
      var card = typeof (context.payload.card) === 'number' && context.payload.card > 0 ? context.payload.card : false
      if (name && card) {
        console.log(card)
        getCartFromClient(name, httpResponse)
      } else {
        httpResponse(400, {
          'Error': 'Missing required fields'
        })
        // TODO: show lacking field
      }
    } else {
      httpResponse(400, {
        'Error': 'not authorized'
      })
    }
  })
}

module.exports = orders