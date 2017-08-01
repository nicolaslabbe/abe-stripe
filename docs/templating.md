# Display product on your template

The goal is to use abe (handlebars) like syntax

Exemple: open single.html template

New helper avaliable:

- **abeStripe** : name
- **abeStripeEvent** : action, event
- **abeStripeAttribute** : name
- **abeStripeCheckout**  :
- **abeStripeCheckoutAttribute** : name

### abeStripe

- skus
- stock
- price

```html
{{{{abeStripe 'skus|stock|price'}}}}
<div></div>
{{{{/abeStripe}}}}
```

after the render inside your template will give you this

```html
<script id="abe-stripe-template-[sku|stock|price]" abe-stripe-template-[skus|stock|price] type="text/x-handlebars-template">
<div></div>
</script>
```

# type Sku

An array of skus will be compiled with the given handlebars template

```json
{
	"skus": [
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
	]
}
```

If you want to display the attributes with handlebars

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

# type stock

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