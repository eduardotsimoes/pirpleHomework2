
Pipeline
                           
[ http server ]    -->    [ router ]    -->    [ handlers ]
    req,res     (context)            (context) 
                (callback)           (callback)   
                                                    |    
                                                    |
                                                    |
                                                   \_/
                                                   data

## I should create some DBadaptors


router : 
    routing based on the url path

handlers :
    routing based on the http method

config : 
    Save the configuration used

You are building the API for a pizza-delivery company. Don't worry about a frontend, just build the API. Here's the spec from your project manager: 

1. New users can be created, their information can be edited, and they can be deleted. We should store their name, email address, and street address.  (DONE)

2. Users can log in and log out by creating or destroying a token. (DONE)

3. When a user is logged in, they should be able to GET all the possible menu items (these items can be hardcoded into the system).  (DONE)

4. A logged-in user should be able to fill a shopping cart with menu items (DONE)

5. A logged-in user should be able to create an order. You should integrate with the Sandbox of Stripe.com to accept their payment. Note: Use the stripe sandbox for your testing. Follow this link and click on the "tokens" tab to see the fake tokens you can use server-side to confirm the integration is working: https://stripe.com/docs/testing#cards (DONE)

6. When an order is placed, you should email the user a receipt. You should integrate with the sandbox of Mailgun.com for this. Note: Every Mailgun account comes with a sandbox email account domain (whatever@sandbox123.mailgun.org) that you can send from by default. So, there's no need to setup any DNS for your domain for this task https://documentation.mailgun.com/en/latest/faqs.html#how-do-i-pick-a-domain-name-for-my-mailgun-account