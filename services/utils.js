'use strict'
var path = require("path");
var fs = require("fs");
var mkdirp = require("mkdirp");
var currentTemplate = null;
var debug = false;
var abe = null;

var Utils = {
  setDebug: function(bool, abe) {
    debug = bool;
  },
  debug: function() {
    console.log(arguments);
  },
  error: function(fn, err) {
    if (debug) {
      var logsFile = path.join(abe.config.root, 'logs', 'stripe-errors.log');
      var logs = Utils.readFileSync(logsFile, result);
      logs = JSON.stringify(err) + logs;
      Utils.writeFileSync(logsFile, logs);
    }
    fn(err);
  },
  exist: function (filepath) {
    try {
      var stat = fs.statSync(filepath)
      if (stat) {
        return true
      }
    } catch (e) {
      return false
    }
  },
  readFileSync: function (filepath) {
    if (this.exist(filepath)) {
      return fs.readFileSync(filepath, 'utf8')
    }else {
      return null
    }
  },
  writeFileSync: function (filepath, obj) {
    var folderPath = filepath.split(path.sep)
    folderPath.pop()
    folderPath = folderPath.join(path.sep)
    if (!this.exist(filepath)) {
      mkdirp(folderPath)
    }
    fs.writeFileSync(filepath, JSON.stringify(obj, null, 4), 'utf8');
  },
  getJson: function(filepath) {
    var item = Utils.readFileSync(filepath)
    if (item) {
      return JSON.parse(item)
    }
    return null
  },
  jsonToProduct: function(json, productAttributes, domain) {
    var title = json.stripeTitle;
    var description = (json.stripeDescription === "") ? title : json.stripeDescription;
    var shippable = (json.stripeShippable === "false") ? false : true;
    var currency = (json.stripeCurrency !== "") ? json.stripeCurrency : 'usd';
    var url = domain.replace(/\/$/, '') + json.abe_meta.link;

    var images = [];
    var attributes = [];

    var skus = []
    if (json.stripeSkus) {
      var i = 0
      Array.prototype.forEach.call(json.stripeSkus, function(stripeSku) {
        if (images.length < 8) {
          images.push(domain.replace(/\/$/, '') + stripeSku.image)
        }
        var sku = {
          price: parseFloat(stripeSku.price.replace(/,/g, '.')) * 100,
          attributes: {},
          inventory: {
            type: (stripeSku.inventory !== "") ? stripeSku.inventory : 'finite'
          },
          image: domain.replace(/\/$/, '') + stripeSku.image,
          currency: currency,
          active: true
        }

        if (stripeSku.inventory === 'bucket') {
          sku.inventory['value'] = (stripeSku.inventoryValue !== "") ? stripeSku.inventoryValue : 'in_stock'
        }else {
          sku.inventory['quantity'] = (stripeSku.stock !== "") ? parseInt(stripeSku.stock) : 1
        }

        Array.prototype.forEach.call(productAttributes, function(productAttribute) {
          if (stripeSku[productAttribute.name]) {
            if (attributes.indexOf(productAttribute.name) === -1) {
              attributes.push(productAttribute.name);
            }
            sku.attributes[productAttribute.name] = stripeSku[productAttribute.name];
          }
        })
        skus.push(sku)
        i++;
      })
    }

    var obj = {
      product: {
        name: title,
        description: description,
        attributes: attributes,
        active: true,
        shippable: shippable,
        images: images,
        url: url
      },
      skus: skus
    }

    return obj
  }
};


module.exports = Utils;