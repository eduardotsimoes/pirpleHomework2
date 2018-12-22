
var user = require('./user')
var cart = require('./cart')
var pizzaList = require('./pizzaList')
var tokens = require('./tokens')
var orders = require('./orders')
var handlers = {}

// FIXME: remove use of if-else
handlers.user = function (context, httpResponse) {
  if (context.method === 'get') {
    user.readUser(context, httpResponse)
  } else if (context.method === 'post') {
    user.post(context, httpResponse)
  } else if (context.method === 'put') {
    user.put(context, httpResponse)
  } else if (context.method === 'delete') {
    user.deleteUser(context, httpResponse)
  } else {
    httpResponse(404, {
      'result': 'failed!'
    })
  }
}

// FIXME: remove use of if-else
handlers.tokens = function (context, httpResponse) {
  if (context.method == 'get') {
    tokens.get(context, httpResponse);
  }
  else if (context.method == 'post') {
    tokens.post(context, httpResponse);
  }
  else if (context.method == 'put') {
    tokens.put(context, httpResponse);
  }
  else if (context.method == 'delete') {
    tokens.delete(context, httpResponse);
  }
  else {
    httpResponse(404, {
      'result': 'failed!'
    });
  }
};

handlers.pizzaList = function (context, httpResponse) {
  if (context.method === 'get') {
    pizzaList.get(context, httpResponse)
  } else {
    httpResponse(404, {
      'result': 'failed!'
    })
  }
}

handlers.cart = function (context, httpResponse) {
  if (context.method === 'get') {
    cart.get(context, httpResponse)
  } else if (context.method === 'post') {
    cart.post(context, httpResponse)
  } else {
    httpResponse(404, {
      'result': 'failed!'
    })
  }
}

handlers.orders = function (context, httpResponse) {
  if (context.method === 'post') {
    orders.post(context, httpResponse)
  } else {
    httpResponse(404, {
      'result': 'failed!'
    })
  }
}

handlers.notFound = function (context, httpResponse) {
  httpResponse(404, {
    'result': 'failed! handler notFound'
  })
}

exports.handlers = handlers
