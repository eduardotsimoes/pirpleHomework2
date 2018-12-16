//////
// CRUD -- USER
/////

var _data = require('./data');
var _helpers = require('./helpers');
var _tokens = require('./tokens');

var TABLE_NAME = "user"

var inputSanitation = function (payload) {

  var name = typeof (payload.name) == 'string' && payload.name.trim().length > 0 ? payload.name.trim() : false;
  // TODO: validate the e-mail format
  var email = typeof (payload.email) == 'string' && payload.email.trim().length > 0 ? payload.email.trim() : false;
  var address = typeof (payload.address) == 'string' && payload.address.trim().length > 0 ? payload.address.trim() : false;
  // TODO: check password security
  var password = typeof (payload.password) == 'string' && payload.password.trim().length > 0 ? _helpers.hash(payload.password.trim()) : false;

  console.log(password)

  return {
    name: name,
    email: email,
    address: address,
    password: password
  }
};

var user = {};

user.readUser = function (context, httpResponse) {

  console.log("read user");

  console.log(context['queryString']);

  var query = context['queryString'];

  _data.read(TABLE_NAME, query.user, (err, userData) => {
    if (!err) {
      httpResponse(200, userData);
    } else {
      httpResponse(400, {
        'Error': 'Missing required field'
      });
    }
  })
};

user.createUser = function (context, httpResponse) {

  var key = "eduardotsimoes@gmail.com";

  var payload = context['payload'];

  let {
    name,
    email,
    address,
    password
  } = inputSanitation(payload);

  if (name && email && address && password) {
    // Make sure the user doesnt already exist
    _data.read(TABLE_NAME, email, function (err, data) {
      if (err) {

        var userObject = {
          'name': name,
          'email': email,
          'address': address,
          'password': password
        };

        // Store the user
        _data.create(TABLE_NAME, email, userObject, function (err) {
          if (!err) {
            httpResponse(200);
          } else {
            console.log(err);
            httpResponse(500, {
              'Error': 'Could not create the new user'
            });
          }
        });

      } else {
        // User alread exists
        httpResponse(400, {
          'Error': 'A user with that email already exists'
        });
      }
    });

  } else {
    httpResponse(400, {
      'Error': 'Missing required fields'
    });
    // TODO: show lacking field
  }

};

// Required data: email
user.updateUser = function (context, httpResponse) {
  // Check for required field
  var payload = context['payload'];

  let {
    name,
    email,
    address,
    password
  } = inputSanitation(payload);

  // Error if phone is invalid
  if (email) {
    // Error if nothing is sent to update
    if (name || address) {

      // Get token from headers
      var token = typeof (context.headers.token) == 'string' ? context.headers.token : false;

      // Verify that the given token is valid for the phone number
      _tokens.verifyToken(token, email, function (tokenIsValid) {
        if (tokenIsValid) {

          // Lookup the user
          _data.read(TABLE_NAME, email, function (err, userData) {
            if (!err && userData) {

              // Update the fields if necessary
              if (name) {
                userData.name = name;
              }
              if (address) {
                userData.address = address;
              }

              // Store the new updates
              _data.update(TABLE_NAME, email, userData, function (err) {
                if (!err) {
                  httpResponse(200, userData);
                } else {
                  httpResponse(500, {
                    'Error': 'Could not update the user.'
                  });
                }
              });
            } else {
              httpResponse(400, {
                'Error': 'Specified user does not exist.'
              });
            }
          });

        } else {
          httpResponse(403, {
            "Error": "Missing required token in header, or token is invalid."
          });
        }
      });

    } else {
      httpResponse(400, {
        'Error': 'Missing fields to update.'
      });
    }
  } else {
    httpResponse(400, {
      'Error': 'Missing required field.'
    });
  }

};

// Required data: email
// TODO: Cleanup (delete) any other data files associated with the user
user.deleteUser = function (context, httpResponse) {

  // Check that email number is valid
  var payload = context['payload'];

  let {
    name,
    email,
    address,
    password
  } = inputSanitation(payload);

  // TODO: Only let an authenticated user delete their object. Dont let them delete update elses.

  if (email) {

    // Get token from headers
    var token = typeof (context.headers.token) == 'string' ? context.headers.token : false;

    // Verify that the given token is valid for the phone number
    _tokens.verifyToken(token, email, function (tokenIsValid) {
      if (tokenIsValid) {

        // Lookup the user
        _data.read(TABLE_NAME, email, function (err, userData) {
          if (!err && userData) {
            _data.delete(TABLE_NAME, email, function (err) {
              if (!err) {
                httpResponse(200);
              } else {
                httpResponse(500, {
                  'Error': 'Could not delete the specified user'
                });
              }
            });
          } else {
            httpResponse(400, {
              'Error': 'Could not find the specified user.'
            });
          }
        });

      } else {
        httpResponse(403, {
          "Error": "Missing required token in header, or token is invalid."
        });
      }
    });

  } else {
    httpResponse(400, {
      'Error': 'Missing required field'
    });
  }
};

module.exports = user;