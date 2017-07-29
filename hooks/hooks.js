'use strict'
var path = require("path");
var fs = require("fs");
var mkdirp = require("mkdirp");
var Api = require("../services/Api");
var Utils = require("../services/Utils");

var currentTemplate = null;
var frontScript = '';

var templateStripe = ""
var templateBeforeBodyTag = ""

var currentOrder = 1000
function order() {
  return currentOrder++
}

function prepareTemplate(abe) {
  templateStripe = "{{abe order=\"" + order() + "\" type=\"text\" key=\"stripeTitle\" desc=\"Name\" tab=\"Stripe\" visible=\"false\" required=\"true\"}}\n";
  
  templateStripe += "{{abe order=\"" + order() + "\" type=\"text\" key=\"stripeDescription\" desc=\"Description\" tab=\"Stripe\" visible=\"false\"}}\n";
  templateStripe += "{{abe order=\"" + order() + "\" type='data' desc=\"Shippable\" key='stripeShippable' source='[\"true\", \"false\"]' editable='true' max-length=\"1\" tab=\"Stripe\" visible=\"false\"}}\n";
  templateStripe += "{{abe order=\"" + order() + "\" type='data' desc=\"Currency\" key='stripeCurrency' source='reference/abe-stripe-currency.json' editable='true' max-length=\"1\" tab=\"Stripe\" visible=\"false\"}}\n";
  
  var refFilePathAttributes = path.join(abe.config.root, 'reference', 'abe-stripe-attributes.json');
  var attributes = [];
  if(abe.coreUtils.file.exist(refFilePathAttributes)) {
    attributes = JSON.parse(fs.readFileSync(refFilePathAttributes, 'utf8'))
  }
  templateStripe += "{{#each stripeSkus}}\n"
  templateStripe += "    {{abe order=\"" + order() + "\" type=\"text\" key=\"stripeSkus.price\" desc=\"Price\" tab=\"Stripe\" visible=\"false\"}}\n";
  templateStripe += "    {{abe order=\"" + order() + "\" type='data' desc=\"Inventory\" key='stripeSkus.inventory' source='[\"finite\", \"bucket\"]' editable='true' max-length=\"1\" tab=\"Stripe\" visible=\"false\"}}\n";
  templateStripe += "    {{abe order=\"" + order() + "\" type='data' desc=\"Inventory value\" key='stripeSkus.inventoryValue' source='[\"in_stock\", \"limited\", \"out_of_stock\"]' editable='true' max-length=\"1\" tab=\"Stripe\" visible=\"false\"}}\n";
  templateStripe += "    {{abe order=\"" + order() + "\" type='file' desc=\"Image\" key='stripeSkus.image' editable='true' tab=\"Stripe\" visible=\"false\"}}\n";
  templateStripe += "    {{abe order=\"" + order() + "\" type=\"text\" key=\"stripeSkus.stock\" desc=\"Stock\" tab=\"Stripe\" visible=\"false\"}}\n";
  if(typeof attributes !== 'undefined' && attributes !== null) {
    Array.prototype.forEach.call(attributes, function(attribute) {
      if (attribute.source) {
        templateStripe += "    {{abe order=\"" + order() + "\" key=\"stripeSkus." + attribute.name + "\" type=\"data\" source='" + JSON.stringify(attribute.source) + "' editable='true' max-length=\"1\" desc=\"" + attribute.name +"\" tab=\"Stripe\" visible=\"false\"}}\n";
        // templateStripe += "    {{abe key=\"stripeSkus." + attribute.name + "\" type=\"data\" source=\"" + JSON.stringify(attribute.source).replace(/"/g, '\\"') + "\" desc=\"" + attribute.name +" tab=\"Stripe\" visible=\"false\"}}\n";
      }else {
        templateStripe += "    {{abe order=\"" + order() + "\" key=\"stripeSkus." + attribute.name + "\" type=\"text\" desc=\"" + attribute.name +" tab=\"Stripe\" visible=\"false\"}}\n";
      }
    })
  }
  templateStripe += "{{/each}}\n";
  
  templateBeforeBodyTag = "<script src=\"https://js.stripe.com/v3/\"></script>\n"
  templateBeforeBodyTag += "<script>\n"
  templateBeforeBodyTag += "var stripeProductId = '{{@root.stripeProduct.id}}';\n"
  templateBeforeBodyTag += "var stripe = Stripe('" + abe.config.stripe.publicKey + "');\n"
  templateBeforeBodyTag += frontScript + "\n"
  templateBeforeBodyTag += "</script>\n"
}

var hooks = {
  afterHandlebarsHelpers: function (Handlebars, abe) {
    Handlebars.registerHelper('abeStripe', function (name, obj) {
      var text = '<script id="abe-stripe-template-' + name + '" abe-stripe-template-' + name + ' type="text/x-handlebars-template">'
      text += obj.fn(this).replace(/\[\[/g, '{{').replace(/\]\]/g, '}}')
      text += '</script>'
      return text
    });

    Handlebars.registerHelper('abeStripeEvent', function (action, event, obj) {
      return "abe-stripe-event=\"" + event + "\" abe-stripe-action=\"" + action + "\""
    });

    Handlebars.registerHelper('abeStripeAttribute', function (name, obj) {
      return "abe-stripe-attribute=\"" + name + "\""
    });

    Handlebars.registerHelper('abeStripeCheckout', function (obj) {
      return "abe-stripe-checkout=\"true\""
    });

    Handlebars.registerHelper('abeStripeCheckoutAttribute', function (name, obj) {
      return "abe-stripe-checkout-attribute=\"" + name + "\""
    });

    var frontScriptAbeStripe = path.join(__dirname, '..', 'custom', 'stripe-abe.js')
    if(abe.coreUtils.file.exist(frontScriptAbeStripe)) {
      frontScript = fs.readFileSync(frontScriptAbeStripe, 'utf-8')
    }

    var refFilePathAttributes = path.join(abe.config.root, 'reference', 'abe-stripe-attributes.json')
    if(!abe.coreUtils.file.exist(refFilePathAttributes)) {
      fs.writeFileSync(refFilePathAttributes, JSON.stringify([]), { space: 2, encoding: 'utf-8' })
    }

    var refFilePathCurrency = path.join(abe.config.root, 'reference', 'abe-stripe-currency.json')
    if(!abe.coreUtils.file.exist(refFilePathCurrency)) {
      fs.writeFileSync(refFilePathCurrency, JSON.stringify(["afn","eur","all","dzd","usd","eur","aoa","xcd","xcd","ars","amd","awg","aud","eur","azn","bsd","bhd","bdt","bbd","byn","eur","bzd","xof","bmd","inr","btn","bob","bov","usd","bam","bwp","nok","brl","usd","bnd","bgn","xof","bif","cve","khr","xaf","cad","kyd","xaf","xaf","clp","clf","cny","aud","aud","cop","cou","kmf","cdf","xaf","nzd","crc","xof","hrk","cup","cuc","ang","eur","czk","dkk","djf","xcd","dop","usd","egp","svc","usd","xaf","ern","eur","etb","eur","fkp","dkk","fjd","eur","eur","eur","xpf","eur","xaf","gmd","gel","eur","ghs","gip","eur","dkk","xcd","eur","usd","gtq","gbp","gnf","xof","gyd","htg","usd","aud","eur","hnl","hkd","huf","isk","inr","idr","xdr","irr","iqd","eur","gbp","ils","eur","jmd","jpy","gbp","jod","kzt","kes","aud","kpw","krw","kwd","kgs","lak","eur","lbp","lsl","zar","lrd","lyd","chf","eur","eur","mop","mkd","mga","mwk","myr","mvr","xof","eur","usd","eur","mro","mur","eur","xua","mxn","mxv","usd","mdl","eur","mnt","eur","xcd","mad","mzn","mmk","nad","zar","aud","npr","eur","xpf","nzd","nio","xof","ngn","nzd","aud","usd","nok","omr","pkr","usd","pab","usd","pgk","pyg","pen","php","nzd","pln","eur","usd","qar","eur","ron","rub","rwf","eur","shp","xcd","xcd","eur","eur","xcd","wst","eur","std","sar","xof","rsd","scr","sll","sgd","ang","xsu","eur","eur","sbd","sos","zar","ssp","eur","lkr","sdg","srd","nok","szl","sek","chf","che","chw","syp","twd","tjs","tzs","thb","usd","xof","nzd","top","ttd","tnd","try","tmt","usd","aud","ugx","uah","aed","gbp","usd","usd","usn","uyu","uyi","uzs","vuv","vef","vnd","usd","usd","xpf","mad","yer","zmw","zwl","xba","xbb","xbc","xbd","xts","xxx","xau","xpd","xpt","xag"]), { space: 2, encoding: 'utf-8' })
    }

    if (abe.config.stripe) {
      Api.init(abe.config.stripe.key, abe.config.stripe.debug === true)
    }else {
      console.log('Cannot read ./abe.json stripe config')
    }

    prepareTemplate(abe);

    return Handlebars
  },
  afterGetJson: function(json, abe) {
    if (json.abe_meta && abe.config.stripe.templates.indexOf(json.abe_meta.template) > -1) {
      var url = json.abe_meta.link.replace('.html', '.json')
      var productPath = path.join(abe.config.root, 'products', url)
      var product = Utils.getJson(productPath)
      json.stripeProduct = product
    }

    // json.stripeKey = abe.config.stripe.key
    return json
  },
  beforeGetTemplate: function (file, abe) {
    currentTemplate = file.split(path.sep).pop()

    return file
  },
  afterGetTemplate: function (text, abe) {
    if (abe.config.stripe.templates.indexOf(currentTemplate) > -1) {
      // text = templateStripe + text.replace('</body>', templateBeforeBodyTag + '</body>')
      text = templateStripe + text
    }

    currentTemplate = null

    return text
  },
  afterPageEditorCompile: function (tmp, json, abe) {
    // if (abe.config.stripe.templates.indexOf(json.abe_meta.template) > -1) {
      tmp = tmp.replace('</body>', templateBeforeBodyTag + '</body>')
    // }

    currentTemplate = null

    return tmp
  },
  afterPageSaveCompile: function (tmp, json, abe) {
    // if (abe.config.stripe.templates.indexOf(json.abe_meta.template) > -1) {
      tmp = tmp.replace('</body>', templateBeforeBodyTag + '</body>')
    // }

    currentTemplate = null

    return tmp
  },
  beforeDraft: function (json, postUrl, abe) {
    // if (json.stripePrice) {
    //   json.stripePriceRounded = parseInt(json.stripePrice) / 100
    // }
    return json
  },
  afterPublish: function (json, postUrl, abe) {
    if(typeof abe.config.stripe.templates !== 'undefined' && abe.config.stripe.templates !== null) {
      if (abe.config.stripe.templates.indexOf(json.abe_meta.template) > -1) { // this is a product

        var refFilePathAttributes = path.join(abe.config.root, 'reference', 'abe-stripe-attributes.json');
        var attributes = [];
        if(abe.coreUtils.file.exist(refFilePathAttributes)) {
          attributes = JSON.parse(fs.readFileSync(refFilePathAttributes, 'utf8'))
        }
        var productPath = path.join(abe.config.root, 'products', postUrl.replace('.html', '.json'))
        Api.createOrUpdateProduct(json, productPath, attributes, abe.config.stripe.domain)
          .then(function (product) {
          },
          function (err) {
          })
      }
    }

    return json;
  },
  beforeDeleteFile: function (filePath, abe) {
    var productPath = path.join(abe.config.root, 'products', filePath.replace('.html', '.json'))
    Api.removeProduct(productPath)
      .then(function (product) {
      },
      function (err) {
      })

    return filePath
  },
  beforeUnpublish: function (filePath, abe) {
    var productPath = path.join(abe.config.root, 'products', filePath.replace('.html', '.json'))
    Api.removeProduct(productPath)
      .then(function (product) {
      },
      function (err) {
      })

    return filePath
  }
};

exports.default = hooks;