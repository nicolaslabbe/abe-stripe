'use strict';

var fs = require('fs');
var path = require('path');

function openFileSync(filepath, abe) {
  try {
    var stat = fs.statSync(path.join(abe.config.root, filepath))
    if (stat) {
      return fs.readFileSync(path.join(abe.config.root, filepath), 'utf8')
    }
  } catch (e) {
    console.log('stripe plugin error', e)
    return null
  }
}

var route = function route(req, res, next, abe) {

  if(req.query.stripe_private_key != null) {

    if (!abe.config.stripe) {
      abe.config.stripe = {}
    }
    abe.config.stripe.domain = req.query.abe_domain;
    abe.config.stripe.debug = req.query.stripe_debug === "true" ? true : false;
    abe.config.stripe.key = req.query.stripe_private_key;
    abe.config.stripe.publicKey = req.query.stripe_public_key;
    abe.config.stripe.templates = req.query.templates ? req.query.templates.split(',') : [];

    var json
    try {
      json = JSON.parse(openFileSync('abe.json', abe))
    }catch(e) {
      json = {}
    }

    if (!json.stripe) {
      json.stripe = {}
    }
    json.stripe.domain = req.query.abe_domain;
    json.stripe.debug = req.query.stripe_debug === "true" ? true : false;
    json.stripe.key = req.query.stripe_private_key;
    json.stripe.publicKey = req.query.stripe_public_key;
    json.stripe.templates = req.query.templates ? req.query.templates.split(',') : [];

    fs.writeFileSync(abe.config.root + '/abe.json', JSON.stringify(json, null, 4), 'utf8');
    res.json({'success': true});
    return;
  }

  var templates = []
  var pathTemplates = path.join(
    abe.config.root,
    abe.config.themes.path,
    abe.config.themes.name,
    abe.config.themes.templates.path
  )

  abe.cmsTemplates.template.getTemplatesAndPartials(pathTemplates, null)
    .then(function (templatesList) {

      abe.cmsTemplates.template.getTemplatesTexts(templatesList)
        .then(function (templatesText) {

          Array.prototype.forEach.call(templatesText, (templateText) => {
            if (abe.config.stripe) {
              templates.push({
                checked: (abe.config.stripe.templates.indexOf(templateText.name) > -1) ? true : false,
                name: templateText.name
              })
            }
          })


          var data = path.join(__dirname + '/../../partials/config.html')
          var html = abe.coreUtils.file.getContent(data);
          var template = abe.Handlebars.compile(html, {noEscape: true})
          var tmp = template({
            manager: {config: JSON.stringify(abe.config)},
            config: abe.config,
            user: res.user,
            templates: templates,
            isPageConfigStripe: true
          })
          res.send(tmp);
        })
      }) 
}

exports.default = route