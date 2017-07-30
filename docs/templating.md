# Display product on your template

The goal is to use abe (handlebars) like syntax

Exemple: open single.html template

New helper avaliable:

- **abeStripe** : name
- **abeStripeEvent** : action, event
- **abeStripeAttribute** : name
- **abeStripeCheckout**  :
- **abeStripeCheckoutAttribute** : name

Display size and colors

```html
{{{{abeStripe 'skus'}}}}
	<ul>
		<li>Size:
			<select>
			{{#each skus}}
				<option value="{{attributes.size}}">
					{{attributes.size}}
				</option>
			{{/each}}
			</select>
		</li>
		<li>Color:
			<select>
			{{#each skus}}
				<option value="{{attributes.gender}}">
					{{attributes.Color}}
				</option>
			{{/each}}
			</select>
		</li>
	</ul>
{{{{/abeStripe}}}}
```

Use `abeStripe` helper type `skus` will give you the product json

```json
{
  "product": {
    "active": true,
    "attributes": [
      "size",
      "color"
    ],
    "caption": null,
    "created": 1501321079,
    "deactivate_on": [],
    "description": "you should buy me",
    "id": "prod_B75ZfzEn47e80N",
    "images": [
      "https://localhost/image/aovgobn_700b-79de.jpg"
    ],
    "livemode": false,
    "metadata": {},
    "name": "My badass product",
    "object": "product",
    "package_dimensions": null,
    "shippable": true,
    "skus": {
      "data": [
        {
          "active": true,
          "attributes": {
            "color": "red",
            "size": "10"
          },
          "created": 1501414203,
          "currency": "usd",
          "id": "sku_B7UbHhu1PyegwQ",
          "image": "https://localhost/image/aovgobn_700b-79de.jpg",
          "inventory": {
            "quantity": 100,
            "type": "finite",
            "value": null
          },
          "livemode": false,
          "metadata": {},
          "object": "sku",
          "package_dimensions": null,
          "price": 1000,
          "product": "prod_B75ZfzEn47e80N",
          "updated": 1501414203
        }
      ],
      "has_more": false,
      "object": "list",
      "total_count": 1,
      "url": "/v1/skus?product=prod_B75ZfzEn47e80N&active=true"
    },
    "updated": 1501414278,
    "url": "https://localhost/test-test.html"
  },
  "success": 1
}
```

You can now loop over skus like this

```
{{#each skus}}
	<option value="{{attributes.size}}">
		{{attributes.size}}
	</option>
{{/each}}
```

![](docs/screenshots/abe-stripe-skus-display.png)

Explaination:

The previous example will add this on your template and will be rendered not with abe but with handlebars

```html
<script id="abe-stripe-template-skus" abe-stripe-template-skus type="text/x-handlebars-template">
<ul>
	<li>Size:
		<select {{{abeStripeAttribute 'size'}}} {{{abeStripeEvent 'sku' 'change'}}} data-price-wrapper="true">
		{{#each skus}}
			<option value="{{attributes.size}}">
				{{attributes.size}}
			</option>
		{{/each}}
		</select>
	</li>
	<li>Gender:
		<select {{{abeStripeAttribute 'color'}}} {{{abeStripeEvent 'sku' 'change'}}} data-price-wrapper="true">
		{{#each skus}}
			<option value="{{attributes.color}}">
				{{attributes.gender}}
			</option>
		{{/each}}
		</select>
	</li>
</ul>
</script>```

Why render on frontend side ? because of inventory

### Display inventory

```html
<div>
{{{{abeStripe 'stock'}}}}
	{{inventory.quantity}}
{{{{/abeStripe}}}}
</div>
```

Here is the result 

```html
<script id="abe-stripe-template-stock" abe-stripe-template-stock type="text/x-handlebars-template">											{{inventory.quantity}}
</script>
```