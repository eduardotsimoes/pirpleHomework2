
var http = require('http');

var url = require('url');

var server = http.createServer((req,res)=>{

   //parse the passe url
   var urlParsed = url.parse(req.url,true);
   
   // path from url
   var path = urlParsed.path;
   
   // it is necessary to replace any slash at the end to avoid sensitivity to way it is written
   var trimmedPath = path.replace(/^\/+|\/+$/g,'');
   
   // routing based on path from url
   var chosenHandler = typeof(router[trimmedPath])!=='undefined'? router[trimmedPath] : handlers.notFound ;

   // the http metho
   var method = req.method.toLowerCase();

   var data = {
     'path' : path ,
     'trimmedPath': trimmedPath,
     'method' : method

   };

   chosenHandler(data, function callback(statusCode,payload){
          
	statusCode = typeof(statusCode) == 'number' ? statusCode : 200;
	
	payload = typeof(payload) == 'object' ? payload : {};

	var payloadString = JSON.stringify(payload); 

        // write the response  
        res.setHeader('Content-Type','application/json');      
        res.writeHead(statusCode);
        res.end(payloadString); 	      

 
   }); 
   

});


var handlers = {};

handlers.hello = function(data,callback){

  if(data.method == 'post'){
  	callback(406,{'result':'Welcome to the API!'});
  }
  else {
  	callback(404,{'result':'failed!'})
  } 
};


handlers.notFound = function(data,callback){


  callback(404,{'result':'failed!'})

};


var router = {
'hello' : handlers.hello
} 

server.listen(8000,function(){
   console.log('Well Done!!');
});

