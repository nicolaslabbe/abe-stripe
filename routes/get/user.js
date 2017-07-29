'use strict';

var fs = require('fs');
var path = require('path');
var stripeHelper = require("../../services/stripeHelper");

var route = function route(req, res, next, abe) {

  if (!req.cookies || !req.cookies.stripeUser) {
    stripeHelper.User.create()
      .then(
        function (user) {
          res.cookie('stripeUser', user.id);
          res.send({
            success: 1,
            userId: req.cookies.stripeUser
          })
        }.bind(this),
        function (err) {
          res.cookie('stripeUser', null);
          res.send({
            success: 0,
            err: err
          })
        }.bind(this))
  }else {
    res.send({
      success: 1,
      userId: req.cookies.stripeUser
    })
  }
}

exports.default = route