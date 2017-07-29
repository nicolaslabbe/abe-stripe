'use strict';

var fs = require('fs');
var path = require('path');
var stripeHelper = require("../../services/stripeHelper");
var Utils = require("../../services/Utils");
var Api = require("../../services/Api");

var route = function route(req, res, next, abe) {

  if(req.query.url != null) {

    var url = req.query.url.replace('abe/editor/', '')
    url = url.replace('.html', '.json')
    var productPath = path.join(abe.config.root, 'products', url)
    var product = Utils.getJson(productPath)

    if (product) {
      var productId = product.id

      var attributes = {}
      Array.prototype.forEach.call(Object.keys(req.query), function(attr) {
        if (attr !== 'url' && attr !== 'token') {
          attributes[attr] = req.query[attr]
        }
      })

      stripeHelper.Sku.find(productId, attributes)
        .then(function (sku) {
          if (typeof req.cookies !== 'undefined' && req.cookies !== null && req.cookies.stripeUser) {
            stripeHelper.Order.create({
              currency: sku.currency,
              items: [
                {
                  type: 'sku',
                  parent: sku.id,
                  quantity: 1
                }
              ],
              shipping: {
                name: req.cookies.stripeUser,
                address: {
                  line1: '',
                  city: '',
                  state: '',
                  country: '',
                  postal_code: ''
                }
              },
              customer: req.cookies.stripeUser})
              .then(function (order) {
                var orderPath = path.join(abe.config.root, 'orders', order.id + '.json')
                Utils.writeFileSync(orderPath, order);
                res.cookie('stripeOrder', order.id);
                res.send({
                  success: 1
                })
              },
              function (err) {
                res.send({
                  success: 0
                })
              })
          }else {
            res.send({
              success: 0,
              err: 'no user found'
            })
          }
        }.bind(this),
        function (err) {
          res.send({
            success: 0,
            err: err
          })
        }.bind(this))
    }else {
      res.send({
        success: 0,
        err: 'no product found'
      })
    }
  }else { // return current order

    if (typeof req.cookies !== 'undefined' && req.cookies !== null && req.cookies.stripeOrder) {
      Api.retrieveOrderSkuAndProduct(req.cookies.stripeOrder)
        .then(function (item) {
          item.success = 1
          res.send(item)
        }.bind(this),
        function (err) {
          res.send({
            success: 0,
            err: err
          })
        }.bind(this))
      }else {
        res.send({
          success: 0,
          err: 'no order'
        })
      }
  }
}

exports.default = route