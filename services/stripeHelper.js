'use strict'
var path = require("path");
var Utils = require("./Utils");
var stripe;
var debug = false;
var currentTemplate = null;

var Helper = {
  init: function (key) {
    stripe = require("stripe")(key);
  },
  debug: function () {
    debug = true;
  },
  isReady: function () {
    if(typeof stripe !== 'undefined' && stripe !== null) {
      return true;
    }else {
      return {error: 'stripe is not initialized'};
    }
  }
}

var Order = {
  create: function (obj) {
    return new Promise(function(resolve, reject) {
      if (Helper.isReady() !== true) return reject(Helper.isReady())
      if(typeof obj === 'undefined' || obj === null) return reject({error: 'missing product `obj` to order'})

      stripe.orders.create(obj,
      function(err, order) {
        if (!err) {
          if (debug) console.log('ORDER CREATE:', order.id, 'https://dashboard.stripe.com/test/orders/' + order.id)
          resolve(order)
        }else {
          reject({func: 'Order.create', err: err})
        }
      }.bind(this));
    }.bind(this));
  },
  checkout: function (user, orderId, token) {
    return new Promise(function(resolve, reject) {
      if (Helper.isReady() !== true) return reject(Helper.isReady())
      if(typeof token === 'undefined' || token === null) return reject({error: 'missing order `token`'})
      if(typeof user === 'undefined' || user === null) return reject({error: 'missing order `user`'})
      if(typeof orderId === 'undefined' || orderId === null) return reject({error: 'missing order `orderId`'})

      user.source = token
      stripe.orders.pay(orderId, user,
        function(err, order) {
          if (!err) {
            if (debug) console.log('ORDER CHECKOUT:', order.id, 'https://dashboard.stripe.com/test/orders/' + order.id)
            resolve(order);
          }else {
            reject({func: 'Order.checkout', err: err})
          }
      }.bind(this));
    }.bind(this))
  },
  retrieve: function (id) {
    return new Promise(function(resolve, reject) {
      if (Helper.isReady() !== true) return reject(Helper.isReady())
      if(typeof id === 'undefined' || id === null) return reject({error: 'missing product `id` to order'})

      stripe.orders.retrieve(id,
      function(err, order) {
        if (!err) {
          if (debug) console.log('ORDER RETRIEVE:', order.id, 'https://dashboard.stripe.com/test/orders/' + order.id)
          resolve(order)
        }else {
          reject({func: 'User.retrieve', err: err})
        }
      }.bind(this));
    }.bind(this))
  }
}

var User = {
  create: function () {
    return new Promise(function(resolve, reject) {
      if (Helper.isReady() !== true) return reject(Helper.isReady())

      stripe.customers.create({
        description: 'Anonymous customer'
      },
      function(err, customer) {
        if (!err) {
          if (debug) console.log('USER CREATE:', customer.id, 'https://dashboard.stripe.com/test/customers/' + customer.id)
          resolve(customer)
        }else {
          reject({func: 'User.create', err: err})
        }
      }.bind(this));
    }.bind(this))
  },
  retrieve: function (id) {
    return new Promise(function(resolve, reject) {
      if (Helper.isReady() !== true) return reject(Helper.isReady())
      if(typeof id === 'undefined' || id === null) return reject({error: 'missing product `id` to order'})

      stripe.customers.retrieve(id,
      function(err, customer) {
        if (!err) {
          if (debug) console.log('USER RETRIEVE:', customer.id, 'https://dashboard.stripe.com/test/customers/' + customer.id)
          resolve(customer)
        }else {
          reject({func: 'User.retrieve', err: err})
        }
      }.bind(this));
    }.bind(this))
  },
  update: function (id, obj) {
    return new Promise(function(resolve, reject) {
      if (Helper.isReady() !== true) return reject(Helper.isReady())
      if(typeof id === 'undefined' || id === null) return reject({error: 'missing user `id`'})
      if(typeof obj === 'undefined' || obj === null) return reject({error: 'missing user `obj` to update'})

      stripe.customers.update(id, obj,
        function (err, customer) {
          if (!err) {
            if (debug) console.log('USER UPDATE:', id, 'https://dashboard.stripe.com/test/customers/' + id)
            resolve()
          }else {
            reject({func: 'User.update', err: err})
          }
        }.bind(this))
    }.bind(this))
  }
}

var Product = {
  create: function(obj) {
    return new Promise(function(resolve, reject) {
      if (Helper.isReady() !== true) return reject(Helper.isReady())
      if(typeof obj === 'undefined' || obj === null) return reject({error: 'missing product `obj` to update'})

      stripe.products.create(obj,
      function(err, product) {
        if (!err) {
          if (debug) console.log('PRODUCT CREATE:', product.id, 'https://dashboard.stripe.com/test/products/' + product.id)
          resolve(product)
        }else {
          reject({func: 'Product.create', err: err})
        }
      }.bind(this));
    }.bind(this))
  },
  update: function(id, obj) {
    return new Promise(function(resolve, reject) {
      if (Helper.isReady() !== true) return reject(Helper.isReady())
      if(typeof id === 'undefined' || id === null) return reject({error: 'missing product `id`'})
      if(typeof obj === 'undefined' || obj === null) return reject({error: 'missing product `obj` to update'})

      stripe.products.update(id, obj,
        function (err) {
          if (!err) {
            if (debug) console.log('PRODUCT UPDATE:', id, 'https://dashboard.stripe.com/test/products/' + id)
            resolve()
          }else {
            reject({func: 'Product.update', err: err})
          }
        }.bind(this))
    }.bind(this))
  },
  retrieve: function (id) {
    return new Promise(function(resolve, reject) {
      if (Helper.isReady() !== true) return reject(Helper.isReady())
      if(typeof id === 'undefined' || id === null) return reject({error: 'missing product `id`'})

      stripe.products.retrieve(id,
        function(err, product) {
          if (!err) {
            if (debug) console.log('PRODUCT RETRIEVE:', product.id, 'https://dashboard.stripe.com/test/products/' + product.id)
            resolve(product)
          }else {
            reject({func: 'Product.retrieve', err: err})
          }
        }.bind(this))
    }.bind(this))
  },
  delete: function (id) {
    return Product.update(id, { active: false })
  }
}

var Skus = {
  create: function (skus, productId) {
    return new Promise(function(resolve, reject) {
      if (Helper.isReady() !== true) return reject(Helper.isReady())
      if(typeof productId === 'undefined' || productId === null) return reject({error: 'missing `productId`'})
      if(typeof skus === 'undefined' || skus === null) return reject({error: 'missing skus `id`'})
      if(skus.length <= 0) return resolve([])

      var skusCreated = []
      var promises = []
        Array.prototype.forEach.call(skus, function(sku) {
          sku.product = productId
          var promiseSku = Sku.create(sku)
            .then(function (sku) {
              skusCreated.push(sku)
            }.bind(this),
            function (err) {
              reject({func: 'Skus.create', err: err})
            }.bind(this))
          promises.push(promiseSku)
        }.bind(this))

        Promise.all(promises)
          .then(function() {
              if (debug) console.log('SKUS CREATE:')
              resolve(skusCreated)
          }.bind(this))
    }.bind(this))
  },
  find: function (productId) {
    return new Promise(function(resolve, reject) {
      if (Helper.isReady() !== true) return reject(Helper.isReady())
      if(typeof productId === 'undefined' || productId === null) return reject({error: 'missing `productId`'})
      var objToFind = {
        product: productId
      }

      stripe.skus.list(objToFind,
      function(err, skus) {
        if (!err) {
          if (skus.data.length > 0) {
            if (debug) console.log('SKUS FIND:', skus.data.length)
            resolve(skus.data)
          }else {
            resolve([])
          }
        }else {
          reject({func: 'Skus.find', err: err})
        }
      }.bind(this))
    }.bind(this))
  }
}

var Sku = {
  create: function (obj) {
    return new Promise(function(resolve, reject) {
      if (Helper.isReady() !== true) return reject(Helper.isReady())
      if(typeof obj === 'undefined' || obj === null) return reject({error: 'missing sku `obj` to update'})

      stripe.skus.create(obj,
      function(err, sku) {
        if (!err) {
          if (debug) console.log('SKU CREATE', sku.id, 'https://dashboard.stripe.com/test/products/' + sku.product)
          resolve(sku)
        }else {
          if (debug) console.log('SKU CREATE', err)
          reject({func: 'Sku.create', err: err})
        }
      }.bind(this));
    }.bind(this))
  },
  update: function (id, obj) {
    return new Promise(function(resolve, reject) {
      if (Helper.isReady() !== true) return reject(Helper.isReady())
      if(typeof id === 'undefined' || id === null) return reject({error: 'missing sku `id`'})
      if(typeof obj === 'undefined' || obj === null) return reject({error: 'missing sku `obj` to update'})

      if (obj.inventory && obj.inventory.type === 'bucket') {
        delete obj.inventory.quantity
      }else if(obj.inventory) {
        delete obj.inventory.value
      }
      stripe.skus.update(id, obj,
        function (err) {
          if (!err) {
            if (debug) console.log('SKU UPDATE', id, 'https://dashboard.stripe.com/test/products/' + id)
            resolve()
          }else {
            if (debug) console.log('ERROR SKU UPDATE', err)
            reject({func: 'Sku.update', err: err})
          }
        }.bind(this))
      }.bind(this))
    },
    retrieve: function (id) {
      return new Promise(function(resolve, reject) {
        if (Helper.isReady() !== true) return reject(Helper.isReady())
        if(typeof id === 'undefined' || id === null) return reject({error: 'missing sku `id`'})

        stripe.skus.retrieve(id,
          function(err, sku) {
            if (!err) {
              if (debug) console.log('SKU RETRIEVE', sku.id, 'https://dashboard.stripe.com/test/products/' + sku.product)
              resolve(sku)
            }else {
              reject({func: 'Sku.retrieve', err: err})
            }
          }.bind(this))
      }.bind(this))
  },
  delete: function (id) {
    return Sku.update(id, { active: false, inventory: { quantity: 0 }})
  },
  find: function (productId, attributes) {
    return new Promise(function(resolve, reject) {
      if (Helper.isReady() !== true) return reject(Helper.isReady())
      if(typeof productId === 'undefined' || productId === null) return reject({error: 'missing `productId`'})
      var objToFind = {
        product: productId
      }
      if(typeof attributes !== 'undefined' || attributes !== null) {
        objToFind.attributes = attributes
      }
      stripe.skus.list(objToFind,
      function(err, skus) {
        if (!err) {
          if (skus.data.length > 0) {
            if (debug) console.log('SKU FIND', skus.data[0].id, 'https://dashboard.stripe.com/test/products/' + skus.data[0].id)
            resolve(skus.data[0])
          }else {
            resolve(null)
          }
        }else {
          reject({func: 'Sku.find', err: err})
        }
      }.bind(this))
    }.bind(this))
  }
}

module.exports = {
  Helper,
  User,
  Order,
  Product,
  Sku,
  Skus
};