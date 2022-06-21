const fs = require('fs');
const path = require('path');
const _ = require('underscore');
const counter = require('./counter');

var items = {};

// Public API - Fix these CRUD functions ///////////////////////////////////////

exports.create = (text, callback) => {
  counter.getNextUniqueId((err, id) => {
    if (err) {
      throw ('error writing text');
    } else {
      fs.writeFile(`${exports.dataDir}/${id}.txt`, text, err => {
        if (err) {
          throw ('error writing text');
          return;
        } else {
          callback(null, { id, text });
        }
      });
    }
  });
};

exports.readAll = (callback) => {
  fs.readdir(exports.dataDir, (err, files) => {
    if (err) {
      throw ('error get files');
    } else {
      if (files.length === 0) {
        callback(null, []);
        return;
      }
      files = files.map(file => {
        return new Promise((resolve, reject) => {
          fs.readFile(`${exports.dataDir}/${file}`, 'utf8', (err, fileData) => {
            if (err) {
              reject(err);
            } else {
              resolve({id: file.split('.')[0], text: file.split('.')[0]});
            }
          });
        });
      });
      Promise.all(files)
        .then(values => callback(null, values))
        .catch(err => console.error(err));
    }
  });
};

exports.readOne = (id, callback) => {
  var text = items[id];
  if (!text) {
    callback(new Error(`No item with id: ${id}`));
  } else {
    callback(null, { id, text });
  }
};

exports.update = (id, text, callback) => {
  var item = items[id];
  if (!item) {
    callback(new Error(`No item with id: ${id}`));
  } else {
    items[id] = text;
    callback(null, { id, text });
  }
};

exports.delete = (id, callback) => {
  var item = items[id];
  delete items[id];
  if (!item) {
    // report an error if item not found
    callback(new Error(`No item with id: ${id}`));
  } else {
    callback();
  }
};

// Config+Initialization code -- DO NOT MODIFY /////////////////////////////////

exports.dataDir = path.join(__dirname, 'data');

exports.initialize = () => {
  if (!fs.existsSync(exports.dataDir)) {
    fs.mkdirSync(exports.dataDir);
  }
};
