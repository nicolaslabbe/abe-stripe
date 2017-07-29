'use strict'
var Utils = require("./Utils");
var stripeHelper = require('./stripeHelper');
var debug = false;

var Api = {
  init: function (key, debug) {
    stripeHelper.Helper.init(key)
    if (debug) {
      debug = true;
      stripeHelper.Helper.debug()
    }
  },
  reject(fn, err) {
    if (debug) {
      console.log('ERROR', err)
    }
    fn(err);
  },
  createProduct: function(obj) {
    return new Promise(function(resolve, reject) {
      stripeHelper.Product.create(obj.product)
        .then(function (product) {
          stripeHelper.Skus.create(obj.skus, product.id)
            .then(
              function (skus) {
                stripeHelper.Product.retrieve(product.id)
                  .then(
                    function (product) { resolve(product) }.bind(this),
                    function (err) { this.reject(reject, err) }.bind(this))
              }.bind(this),
              function (err) { this.reject(reject, err) }.bind(this))
        }.bind(this),
        function (err) { this.reject(reject, err) }.bind(this))
    }.bind(this));
  },
  updateProduct: function(obj) {
    return new Promise(function(resolve, reject) {

      var productId = obj.product.id
      delete obj.product.id
      stripeHelper.Product.update(productId, obj.product)
        .then(function () {

          var promises = []
          var skuIdsUpdated = []
          Array.prototype.forEach.call(obj.skus, function(itemSku) {
            promises.push(stripeHelper.Sku.find(productId, itemSku.attributes)
              .then(function (sku) {
                if (sku !== null) {
                  skuIdsUpdated.push(sku.id)
                  delete itemSku.id
                  promises.push(stripeHelper.Sku.update(sku.id, itemSku)
                    .then(function () {
                      // ok
                    }.bind(this),
                    function (err) {
                      this.reject(reject, err)
                    }.bind(this)))
                }else {
                  itemSku.product = productId
                  promises.push(stripeHelper.Sku.create(itemSku)
                    .then(function (sku) {
                      skuIdsUpdated.push(sku.id)
                    }.bind(this),
                    function (err) {
                      this.reject(reject, err)
                    }.bind(this)))
                }
              }.bind(this),
              function (err) { this.reject(reject, err) }.bind(this)))
          }.bind(this))

          Promise.all(promises)
            .then(function() {
              stripeHelper.Skus.find(productId)
                .then(function (skus) {
                  Array.prototype.forEach.call(skus, function(sku) {
                    if (skuIdsUpdated.indexOf(sku.id) === -1) {
                      stripeHelper.Sku.delete(sku.id)
                        .then(function (sku) { }.bind(this), function (err) { }.bind(this))
                    }
                  }.bind(this))

                  stripeHelper.Product.retrieve(productId)
                      .then(
                        function (product) { resolve(product) }.bind(this),
                        function (err) { this.reject(reject, err) }.bind(this))
                }.bind(this),
                function (err) {
                  this.reject(reject, err)
                }.bind(this))
              }.bind(this))
          
        }.bind(this),
        function (err) { this.reject(reject, err) }.bind(this))
    }.bind(this));
  },
  createOrUpdateProduct: function(json, filepath, productAttributes, domain) {
    return new Promise(function(resolve, reject) {

      var item = Utils.getJson(filepath)
      var obj = Utils.jsonToProduct(json, productAttributes, domain)
      var updateOrCreate = this.createProduct
      if (item) {
        obj.product.id = item.id
        updateOrCreate = this.updateProduct
      }

      updateOrCreate(obj)
        .then(function (result) {
          Utils.writeFileSync(filepath, result);
          resolve(result);
        }.bind(this),
        function (err) {
          this.reject(reject, err);
        }.bind(this))

    }.bind(this));
  },
  removeProduct: function(filepath) {
    return new Promise(function(resolve, reject) {
      var promises = [];
      var product = Utils.getJson(filepath);
      if (product) {
        promises.push(stripeHelper.Product.delete(product.id));

        if (product.skus && product.skus.data) {
          Array.prototype.forEach.call(product.skus.data, function(sku) {
            promises.push(stripeHelper.Sku.delete(id)
              .then(function () {
                
              }.bind(this),
              function (err) { this.reject(reject, err); }.bind(this)))
          })
        }

        Promise.all(promises)
          .then(function() {
            stripeHelper.Product.retrieve(id)
            .then(
              function (product) {
                Utils.writeFileSync(filepath, product);
                resolve(true);
              }.bind(this),
              function (err) { this.reject(reject, err); }.bind(this))
        }.bind(this))
      }else {
        this.reject(reject, {error: 'no product'});
      }
    }.bind(this))
  },
  retrieveOrderSkuAndProduct: function(orderId) {
    return new Promise(function(resolve, reject) {
      stripeHelper.Order.retrieve(orderId)
        .then(function (order) {
          var sku
          Array.prototype.forEach.call(order.items, function(item) {
            if (item.type === 'sku') {
              sku = item
            }
          }.bind(this))

          if (sku) {
            stripeHelper.Sku.retrieve(sku.parent)
              .then(function (sku) {
                stripeHelper.Product.retrieve(sku.product)
                  .then(function (product) {
                    resolve({
                      order: order,
                      product: product,
                      sku: sku
                    })
                  }.bind(this),
                  function (err) {
                    resolve({
                      order: order,
                      product: null,
                      sku: null
                    })
                  }.bind(this))
              }.bind(this),
              function (err) {
                resolve({
                  order: order,
                  product: null,
                  sku: null
                })
              }.bind(this))
          }else {
            resolve({
              order: order,
              product: null,
              sku: null
            })
          }
        }.bind(this),
        function (err) {
          reject(err)
        }.bind(this))
    }.bind(this))
  }
};


module.exports = Api;