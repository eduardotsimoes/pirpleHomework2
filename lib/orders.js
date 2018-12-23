var _data = require('./data')
var _tokens = require('./tokens')
var _pizzas = require('./pizzaList')
var _helpers = require('./helpers')

var qs = require('querystring')
var http = require('https')

var options = {
  "method": "POST",
  "hostname": "api.stripe.com",
  "path": "/v1/charges",
  "auth": "sk_test_51W2Y1mJmiAoWiZd12evQ1Y3:",
  "headers": {
    "cache-control": "no-cache",
    "Postman-Token": "7b52c030-58b6-45ee-8c3e-ceb56a90bc2f"
  }
}

// var req = http.request(options, function (res) {
//   var chunks = []

//   res.on('data', function (chunk) {
//     chunks.push(chunk)
//   })

//   res.on('end', function () {
//     var body = Buffer.concat(chunks)
//     console.log(body.toString())
//   })
// })

var orders = {}

// 1- read the cart of a client with all orders with all the orders
// 3-  post a order whith the total price
// 4 - if it was approved, them clean the card
// Everything is done synchronous
// 1 - the order closes all demands that are in the cart

function getCartFromClient(clientName, httpResponse) {
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
          //////////////////////////////
          // STRIPE Start
          //////////////////////////////
          // send the order 
          let chargeBody
          var req = http.request(options, function (res) {
            var chunks = []
            res.on('data', function (chunk) {
              chunks.push(chunk)
            })
            res.on('end', function () {
              chargeBody = Buffer.concat(chunks)
              var chargeObj = _helpers.parseJsonToObject(chargeBody.toString())
              console.log(chargeBody.toString())
              if (!chargeBody.failure_code) {
                // 1- create the order object with the information.
                var order = {
                  'id' : chargeObj.id,
                  'pizzas': userData.orders,
                  'total': total,
                  'user' : clientName
                }

                _data.create('orders', chargeObj.id, order, (err) => {

                  if (!err) {
                    _data.delete('cart', clientName, (err) => {
                      if (!err) {
                        httpResponse(200)
                      } else {
                        httpResponse(400, 'error - failed to create oreder object')
                      }
                    })
                  } else {
                    httpResponse(400, 'error - failed to create oreder object')
                  }

                })
                // 2- Clean the cart
                //////////////////////
                /////////////////////
              } else {
                httpResponse(400, 'error - failed to aprove sales')
              }
            })
          })
          req.write(qs.stringify({
            amount: total * 100,
            currency: 'eur',
            // TODO: Read client cardname
            source: 'tok_mastercard',
            description: 'Charge for boubounio@example.com'
          }))
          req.end()
          ///////////////////////////////
          /// Stripe END
          ///////////////////////////////

        } else {
          httpResponse(400, {
            'Error': 'couldn\'t read pizza List'
          })
        }
      })
    } else {
      httpResponse(400, {
        'Error': 'the cart is empty'
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