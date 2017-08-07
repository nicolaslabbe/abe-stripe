# Plugin abe-stripe for abecms

```javascript
# run only if new project without package.json
npm init

abe install nicolaslabbe/abe-stripe
```

# Documentation

[Full documentation](docs)

# Quick start 

If you have full control of your website open `abe.json` file

If not see [docs/config.md]()

```javascript
	//...
	"stripe": {
		"domain": "http://localhost:3000",
		"key": "sk_XXXX_XXXXXXXXXXXXXX",
		"publicKey": "pk_test_ypkfmgG2CLw7FdCfSiAshoMD",
		"templates": [
			"product_template"
		],
		"debug": true
	}
	//...
```

Find your stripe key [https://dashboard.stripe.com/account/apikeys]()

`product_template` is the product(s) abe template(s)

set `"debug": true` if you want to log all stripe event into the console

# Admin

Create a new file of type `product_template` the one you choosed of Product type

You should see a new Tab on the edit page called `Stripe`

### Tab fields

- Name
- Description
- Shippable
- Currency
- stripeSkus

When you will publish/update/delete you production the plugin will create/update/delete a linked product into stripe

### Create skus

Edit abe-stripe-attributes.json reference [http://localhost:3000/abe/reference]()

Example `size` sku

```json
[
  {
    "name": "size",
    "type": "text",
    "source": [
      "10",
      "11",
      "12"
    ]
  }
]
```

# Templating

Full documentation [docs/templating.md]()

Helpers:

- **abeStripe** : name
- **abeStripeEvent** : action, event
- **abeStripeAttribute** : name
- **abeStripeCheckout**  :
- **abeStripeCheckoutAttribute** : name

Display size sku and price using `abeStripe 'price|skus'` helper

```html
{{{{abeStripe 'price'}}}}
	<span>{{price}}</span>
{{{{/abeStripe}}}}
	
{{{{abeStripe 'skus'}}}}
Size:
<select>
{{#each skus}}
	<option value="{{attributes.size}}">
		{{attributes.size}}
	</option>
{{/each}}
</select>
{{{{/abeStripe}}}}
```

Add an order button with `abeStripeEvent 'order' 'click'` helper

```html
<a href="#" {{{abeStripeEvent 'order' 'click'}}}>Order</a>
```

Create an other template for example cart.html and display the user current order with `abeStripe 'cart'`

```html
{{{{abeStripe 'cart'}}}}
<img src="{{sku.image}}" class="img-responsive" abe-stripe-order-image alt=""></a>
<div>
	<h5>{{product.name}}</h5>
	<h6>{{product.description}}</h6>
</div>
<div class="check">{{order.amount}}</div>		
<div>{{order.amount}}</div>
{{{{/abeStripe}}}}
```

Create an other template for example checkout.html and display the user current order with `abeStripeCheckout` and `abeStripeCheckout 'attribute name'`

- **abeStripeCheckout** display stripe payment
- **abeStripeCheckoutAttribute** attributes will be saved to the stripe order

```html
<div {{{abeStripeCheckout}}} id="card-element"></div>

email: <input  {{{abeStripeCheckoutAttribute 'email'}}} name="email" />
description: <input  {{{abeStripeCheckoutAttribute 'description'}}} name="description" />
metadata: <input  {{{abeStripeCheckoutAttribute 'metadata'}}} name="metadata" />
line1: <input  {{{abeStripeCheckoutAttribute 'line1'}}} name="line1" />
city: <input  {{{abeStripeCheckoutAttribute 'city'}}} name="city" />
country: <input  {{{abeStripeCheckoutAttribute 'country'}}} name="country" />
line2: <input  {{{abeStripeCheckoutAttribute 'line2'}}} name="line2" />
postal_code: <input  {{{abeStripeCheckoutAttribute 'postal_code'}}} name="postal_code" />
state: <input  {{{abeStripeCheckoutAttribute 'state'}}} name="state" />
name: <input  {{{abeStripeCheckoutAttribute 'name'}}} name="name" />
phone: <input  {{{abeStripeCheckoutAttribute 'phone'}}} name="phone" />

<a href="#" {{{abeStripeEvent 'checkout' 'click'}}}>PROCEED TO BUY</a>
```