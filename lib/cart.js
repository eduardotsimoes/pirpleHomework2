var _data = require('./data')
var _tokens = require('./tokens')
var TABLE_NAME = 'cart'

var cart = {}

cart.get = function (context, httpResponse) {
  var query = context['queryString']

  // Get token from headers
  var token = typeof (context.headers.token) === 'string' ? context.headers.token : false

  // Verify that the given token is valid for the phone number
  _tokens.verifyToken(token, query.user, function (tokenIsValid) {
    if (tokenIsValid) {
      readCart(query, httpResponse)
    } else {
      httpResponse(400, {
        'Error': 'not authorized'
      })
    }
  })
}

function readCart (query, httpResponse) {
  _data.read(TABLE_NAME, query.user, (err, userData) => {
    if (!err) {
      httpResponse(200, userData)
    } else {
      var userObject = {
        'email': query.user,
        'orders': []
      }

      // Store the user
      _data.create(TABLE_NAME, query.user, userObject, function (err) {
        if (!err) {
          httpResponse(200, userObject)
        } else {
          console.log(err)
          httpResponse(500, {
            'Error': 'Could not create the cart'
          })
        }
      })
    }
  })
}

cart.post = function (context, httpResponse) {
  var query = context['queryString']

  // Get token from headers
  var token = typeof (context.headers.token) === 'string' ? context.headers.token : false

  // Verify that the given token is valid for the phone number
  _tokens.verifyToken(token, query.user, function (tokenIsValid) {
    if (tokenIsValid) {
      // Payload : pizza name , quantity
      var name = typeof (context.payload.name) === 'string' && context.payload.name.trim().length > 0 ? context.payload.name.trim() : false
      var quantity = typeof (context.payload.quantity) === 'number' && context.payload.quantity > 0 ? context.payload.quantity : false

      if (name && quantity) {
        addPizzaToTheCart(name, quantity, context.queryString.user, httpResponse)
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

function addPizzaToTheCart (name, quantity, email, httpResponse) {
  // Make sure the user doesnt already exist
  _data.read('pizza', name, function (err, pizzaObject) {
    if (!err) {
      var order = {
        'name': name,
        'quantity': quantity
      }
      console.log(pizzaObject)

      _data.read('cart', email, function (err, cartObject) {
        // Check if table already exist
        // if yes: update
        // Store the new updates
        console.log(cartObject)
        if (!err) {
          cartObject['orders'].push(order)

          _data.update('cart', email, cartObject, function (err) {
            if (!err) {
              httpResponse(200, cartObject)
            } else {
              httpResponse(500, {
                'Error': 'Could not update the user.'
              })
            }
          })
        } else {
          let userObject = {
            'email': email,
            'orders': []
          }
          userObject.orders.push(order)
          _data.create('cart', email, userObject, function (err) {
            if (!err) {
              httpResponse(200, userObject)
            } else {
              console.log(err)
              httpResponse(500, {
                'Error': 'Could not create the new user'
              })
            }
          })
        }
        // else : create
      })
    } else {
      // User alread exists
      httpResponse(400, {
        'Error': 'pizza type not listed'
      })
    }
  })
}

module.exports = cart
