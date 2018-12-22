//Implement CRUD

// The data is saved as a json format where the key is equal the filename
// Each collection is saved in a folder equivalent to SQL table

var fs = require('fs')
var path = require('path')
var helpers = require('./helpers')

var lib = {}

lib.baseDir = path.join(__dirname, '/../data/');

//Create
lib.create = function (dir, file, data, callback) {
  fs.open(lib.baseDir + dir + '/' + file + '.json', 'wx', function (err, fileDescriptor) {
    if (!err && fileDescriptor) {
      var stringData = JSON.stringify(data);
      fs.writeFile(fileDescriptor, stringData, function () {
        if (!err) {
          fs.close(fileDescriptor, function (err) {
            if (!err) {
              callback(false);
            } else {
              callback('error while closing file');
            }
          });
        } else {
          callback('could not write in  file');

        }
      });

    } else {
      callback('could not create file');
    }
  })
}

//Read
lib.read = function (dir, file, callback) {
  fs.readFile(lib.baseDir + dir + '/' + file + '.json', 'utf8', function (err, data) {
    console.log(lib.baseDir + dir + '/' + file + '.json')
    if (!err && data) {
      var parsedData = helpers.parseJsonToObject(data)
      callback(false, parsedData)
    } else {
      callback(err, data)
    }
  })
}

// Update data in a file
lib.update = function (dir, file, data, callback) {

  // Open the file for writing
  fs.open(lib.baseDir + dir + '/' + file + '.json', 'r+', function (err, fileDescriptor) {
    if (!err && fileDescriptor) {
      // Convert data to string
      var stringData = JSON.stringify(data);

      // Truncate the file
      fs.truncate(fileDescriptor, function (err) {
        if (!err) {
          // Write to file and close it
          fs.writeFile(fileDescriptor, stringData, function (err) {
            if (!err) {
              fs.close(fileDescriptor, function (err) {
                if (!err) {
                  callback(false);
                } else {
                  callback('Error closing existing file');
                }
              })
            } else {
              callback('Error writing to existing file');
            }
          })
        } else {
          callback('Error truncating file');
        }
      });
    } else {
      callback('Could not open file for updating, it may not exist yet');
    }
  });

};

// Delete a file
lib.delete = function (dir, file, callback) {

  // Unlink the file from the filesystem
  fs.unlink(lib.baseDir + dir + '/' + file + '.json', function (err) {
    callback(err);
  });

};

lib.printAllData = function (dir, callback) {

  fs.readdir(lib.baseDir + dir, function (err, items) {

    var jsonObj = {
      pizzas: []
    };

    if (!err) {

      var itemsProcessed = 0;

      for (var i = 0; i < items.length; i++) {

        var file = lib.baseDir + dir + '/' + items[i];

        fs.readFile(file, 'utf8', function (err, data) {
          ++itemsProcessed;

          if (!err && data) {
            let parsedData = helpers.parseJsonToObject(data);

            jsonObj.pizzas.push(parsedData);

            if (itemsProcessed === (items.length)) {
              callback(false, jsonObj);
            }

          } else {
            callback(err, data);
          }

        });
      }
    } else {
      callback(err, data);
    }

  });

};

module.exports = lib;