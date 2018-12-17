var _data = require('./data')
var _tokens = require('./tokens')
var pizzaList = {}

pizzaList.get = function (context, httpResponse) {
  var query = context['queryString']

  // Get token from headers
  var token = typeof (context.headers.token) === 'string' ? context.headers.token : false

  // Verify that the given token is valid for the phone number
  _tokens.verifyToken(token, query.user, function (tokenIsValid) {
    if (tokenIsValid) {
      _data.printAllData('pizza', function (err, userData) {
        if (!err && userData) {
          httpResponse(200, userData)
        } else {
          httpResponse(400, {
            'Error': 'Specified user does not exist.'
          })
        }
      })

    } else {
      httpResponse(400, {
        'Error': 'Invalid Token'
      })
    }

  })
}

module.exports = pizzaList;