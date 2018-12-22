const { handlers } = require('./lib/handlers')

var http = require('http')
var url = require('url')
var helpers = require('./lib/helpers')
var StringDecoder = require('string_decoder').StringDecoder

var server = http.createServer(httpDecoder)

function httpDecoder (req, res) {
  // Decoding start

  // parse the passe url
  var urlParsed = url.parse(req.url, true)

  // path from url
  var path = urlParsed.pathname

  // query string
  var queryStringObject = urlParsed.query

  // Get the headers as an object
  var headers = req.headers
  // the http method
  var method = req.method.toLowerCase()

  // it is necessary to replace any slash at the end to avoid sensitivity to way it is written
  var trimmedPath = path.replace(/^\/+|\/+$/g, '')

  console.log('Request received on path: ' + trimmedPath + ' with method: ' + method + ' and this query string: ', queryStringObject)

  // Get the payload,if any
  var decoder = new StringDecoder('utf-8')
  var buffer = ''

  req.on('data', function (data) {
    buffer += decoder.write(data)
  })

  req.on('end', function httpDecoderEnd () {
    buffer += decoder.end()

    // Decoding end

    var context = {
      'path': path,
      'trimmedPath': trimmedPath,
      'method': method,
      'headers': headers,
      'payload': helpers.parseJsonToObject(buffer),
      'queryString': queryStringObject
    }

    // routing based on path from url
    let chosenHandler = typeof (router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound

    chosenHandler(context, function httpResponse (statusCode, payload) {
      statusCode = typeof (statusCode) === 'number' ? statusCode : 200

      payload = typeof (payload) === 'object' ? payload : {}

      var payloadString = JSON.stringify(payload)

      // write the response
      res.setHeader('Content-Type', 'application/json')
      res.writeHead(statusCode)
      res.end(payloadString)
    })
  })
}

var router = {
  'user': handlers.user,
  'tokens': handlers.tokens,
  'pizzaList': handlers.pizzaList,
  'cart': handlers.cart,
  'orders': handlers.orders
}

server.listen(8000, function () {
  console.log('Well Done!!')
})
