'use strict';

var fs = require('fs');
var path = require('path');
var stripeHelper = require("../../services/stripeHelper");
var Utils = require("../../services/Utils");

var route = function route(req, res, next, abe) {

  var url = req.query.url.replace('abe/editor/', '')
  url = url.replace('.html', '.json')
  var productPath = path.join(abe.config.root, 'products', url)
  var product = Utils.getJson(productPath)

  var attributes = {}
  Array.prototype.forEach.call(Object.keys(req.query), function(attr) {
    if (attr !== 'url') {
      attributes[attr] = req.query[attr]
    }
  })

  if (product) {
    stripeHelper.Sku.find(product.id, attributes)
      .then(function (sku) {
          res.send({
            success: 1,
            sku: sku
          })
        }.bind(this),
        function (err) {
          res.send({
            success: 0,
            err: err,
            sku: null
          })
        }.bind(this))
  }else {
    res.send({
      success: 0,
      sku: null
    })
  }
}

exports.default = route