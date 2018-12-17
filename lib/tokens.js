/*
 * Token Handler
 *
 */

// Dependencies
var _data = require('./data')
var helpers = require('./helpers')

var inputSanitation = function (payload) {
  // TODO: validate the e-mail format
  var email = typeof (payload.email) === 'string' && payload.email.trim().length > 0 ? payload.email.trim() : false
  // TODO: check password security
  var password = typeof (payload.password) === 'string' && payload.password.trim().length > 0 ? helpers.hash(payload.password.trim()) : false
  var id = typeof (payload.id) === 'string' && payload.id.trim().length === 20 ? payload.id.trim() : false
  var extend = typeof (payload.extend) === 'boolean' && payload.extend === true ? true : false

  console.log(password)
  return {
    id: id,
    extend: extend,
    email: email,
    password: password
  }
}

var USER_TABLE_NAME = 'user'
var TOKEN_TABLE_NAME = 'tokens'

// Container for all the tokens methods
var tokens = {}

// Tokens - post
// Required data: email, password
// Optional data: none
tokens.post = function (context, httpResponse) {
  var payload = context['payload']
  let {
    id,
    extend,
    email,
    password
  } = inputSanitation(payload)

  if (email && password) {
    // Lookup the user who matches that phone number
    _data.read(USER_TABLE_NAME, email, function (err, userData) {
      if (!err && userData) {
        if (password === userData.password) {
          // If valid, create a new token with a random name. Set an expiration date 1 hour in the future.
          var tokenId = helpers.createRandomString(20)
          var expires = Date.now() + 1000 * 60 * 60
          var tokenObject = {
            'email': email,
            'id': tokenId,
            'expires': expires
          }

          // Store the token
          _data.create(TOKEN_TABLE_NAME, tokenId, tokenObject, function (err) {
            if (!err) {
              httpResponse(200, tokenObject)
            } else {
              httpResponse(500, {
                'Error': 'Could not create the new token'
              })
            }
          })
        } else {
          httpResponse(400, {
            'Error': 'Password did not match the specified user\'s stored password'
          })
        }
      } else {
        httpResponse(400, {
          'Error': 'Could not find the specified user.'
        })
      }
    })
  } else {
    httpResponse(400, {
      'Error': 'Missing required field(s).'
    })
  }
}

// Tokens - get
// Required data: id
// Optional data: none
tokens.get = function (context, httpResponse) {

  // Check that id is valid
  var id = typeof (context.queryString.id) === 'string' && context.queryString.id.trim().length == 20 ? context.queryString.id.trim() : false;

  if (id) {
    // Lookup the token
    _data.read(TOKEN_TABLE_NAME, id, function (err, tokenData) {
      if (!err && tokenData) {
        httpResponse(200, tokenData)
      } else {
        httpResponse(404)
      }
    })
  } else {
    httpResponse(400, {
      'Error': 'Missing required field, or field invalid'
    })
  }
}

// Tokens - put
// Required data: id, extend
// Optional data: none
tokens.put = function (context, httpResponse) {
  var payload = context['payload']
  let {
    id,
    extend,
    email,
    password
  } = inputSanitation(payload)

  if (id && extend) {
    // Lookup the existing token
    _data.read(TOKEN_TABLE_NAME, id, function (err, tokenData) {
      if (!err && tokenData) {
        // Check to make sure the token isn't already expired
        if (tokenData.expires > Date.now()) {
          // Set the expiration an hour from now
          tokenData.expires = Date.now() + 1000 * 60 * 60
          // Store the new updates
          _data.update('tokens', id, tokenData, function (err) {
            if (!err) {
              httpResponse(200, tokenData)
            } else {
              httpResponse(500, {
                'Error': 'Could not update the token\'s expiration.'
              })
            }
          })
        } else {
          httpResponse(400, {
            'Error': 'The token has already expired, and cannot be extended.'
          })
        }
      } else {
        httpResponse(400, {
          'Error': 'Specified user does not exist.'
        })
      }
    })
  } else {
    httpResponse(400, {
      'Error': 'Missing required field(s) or field(s) are invalid.'
    })
  }
}

// Tokens - delete
// Required data: id
// Optional data: none
tokens.delete = function (context, httpResponse) {
  // Check that id is valid
  var id = typeof (context.queryString.id) == 'string' && context.queryString.id.trim().length == 20 ? context.queryString.id.trim() : false;
  if (id) {
    // Lookup the token
    _data.read(TOKEN_TABLE_NAME, id, function (err, tokenData) {
      if (!err && tokenData) {
        // Delete the token
        _data.delete(TOKEN_TABLE_NAME, id, function (err) {
          if (!err) {
            httpResponse(200);
          } else {
            httpResponse(500, {
              'Error': 'Could not delete the specified token'
            });
          }
        });
      } else {
        httpResponse(400, {
          'Error': 'Could not find the specified token.'
        });
      }
    });
  } else {
    httpResponse(400, {
      'Error': 'Missing required field'
    })
  }
}

// Verify if a given token id is currently valid for a given user
tokens.verifyToken = function (id, email, callback) {
  // Lookup the token
  _data.read(TOKEN_TABLE_NAME, id, function (err, tokenData) {
    if (!err && tokenData) {
      // Check that the token is for the given user and has not expired
      if (tokenData.email === email && tokenData.expires > Date.now()) {
        callback(true)
      } else {
        callback(false)
      }
    } else {
      callback(false)
    }
  })
}

// Export the handlers
module.exports = tokens