'use strict';

var fs = require('fs');
var path = require('path');
var stripeHelper = require("../../services/stripeHelper");
var Utils = require("../../services/Utils");

var route = function route(req, res, next, abe) {
  if(req.query.token != null) {
    if (typeof req.cookies !== 'undefined' && req.cookies !== null
      && req.cookies.stripeUser && req.cookies.stripeOrder) {

      var attributes = {
        customer: req.cookies.stripeUser
      }

      Array.prototype.forEach.call(Object.keys(req.query), function(attr) {
        if (attr !== 'url' && attr !== 'token') {
          attributes[attr] = req.query[attr]
        }
      })

      var userUpdate = {}
      var shipping = {}
      var address = {}
      if (attributes.description) userUpdate.description = attributes.description;
      if (attributes.email) userUpdate.email = attributes.email;
      if (attributes.metadata) userUpdate.metadata = attributes.metadata;
      if (attributes.line1) address.line1 = attributes.line1;
      if (attributes.city) address.city = attributes.city;
      if (attributes.country) address.country = attributes.country;
      if (attributes.line2) address.line2 = attributes.line2;
      if (attributes.postal_code) address.postal_code = attributes.postal_code;
      if (attributes.state) address.state = attributes.state;
      if (attributes.name) shipping.name = attributes.name;
      if (attributes.phone) shipping.phone = attributes.phone;

      if (Object.keys(shipping).length > 0) {
        userUpdate.shipping = shipping;

        if (Object.keys(address).length > 0) {
          userUpdate.shipping.address = address;
        }
      }

      console.log('* * * * * * * * * * * * * * * * * * * * * * * * * * * * *')
      console.log('userUpdate', userUpdate)
      console.log('shipping', shipping)
      console.log('address', address)

      var orderUpdate = {}
      if (attributes.email) orderUpdate.email = attributes.email

      stripeHelper.User.update(req.cookies.stripeUser, userUpdate)
          .then(function (user) {

            stripeHelper.Order.checkout(orderUpdate,
              req.cookies.stripeOrder,
              req.query.token)
                .then(function (order) {
                  res.cookie('stripeOrder', null);
                  res.send({
                    success: 1
                  })
                }.bind(this),
                function (err) {
                  res.send({
                    success: 0,
                    err: err
                  })
                }.bind(this)
              )
          },
          function (err) {
            res.send({
              success: 0,
              err: err
            })
          })
    }else {
      res.send({
        success: 0,
        err: "No user or order found"
      })
    }
  }else {
    res.send({
      success: 0,
      err: "No token provided"
    })
  }
}

exports.default = route