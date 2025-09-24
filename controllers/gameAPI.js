import express from 'express';
import Purchase from '../models/purchase.js';
import dotenv from 'dotenv';
import { getProductPrice } from '../config/products.js';

const gameapiRouter = express.Router();
dotenv.config({ path: './inc.env' });
// === CONFIG ===
const PAYPAL_CLIENT = process.env.PAYPAL_CLIENT_DEMO;
const PAYPAL_SECRET = process.env.PAYPAL_SECRET_DEMO;
const PAYPAL_API = process.env.PAYPAL_API_DEMO; 
const PLAYFAB_TITLE_ID = process.env.PLAYFAB_TITLE_ID;
const PLAYFAB_SECRET = process.env.PLAYFAB_SECRET;
const PLAYFAB_API = process.env.PLAYFAB_API;

gameapiRouter.get('/getTimestamp', (request, response) => {
  const currentUnixSeconds = Math.floor(Date.now() / 1000);
  response.type('text/plain').send(String(currentUnixSeconds));
});

gameapiRouter.get('/getPurchases', async (request, response) => {
  const { user_hash: userHash } = request.query;
  if (!userHash) return response.status(400).json({ code: 1, error: 'user_hash is required' });

  const purchases = await Purchase.find({ userHash, consumed: false }).sort({ created: -1 }).lean();
  const items = purchases.map((p) => ({ created: p.created, package_id: p.packageId }));
  return response.json({ code: 0, data: { items } });
});

async function getPayPalAccessToken() {
  const auth = Buffer.from(`${PAYPAL_CLIENT}:${PAYPAL_SECRET}`).toString("base64");
  const res = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
    method: "POST",
    headers: { 
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials"
  });
  const data = await res.json();
  return data.access_token;
}

gameapiRouter.get('/makePurchase', async (request, response) => {
  
  const {
    package_id: packageId,
    user_hash: userHash,
    timezone,
    back_url: backUrl,
    site,
  } = request.query;

  if (!packageId || !userHash) {
    return response.status(400).json({ code: 1, error: 'package_id and user_hash are required' });
  }


  const created = Date.now();

  //Use paypal API to capture payment. If successful, create a purchase record and redirect to the back_url.
  
  try {
    // Get PayPal access token
    const accessToken = await getPayPalAccessToken();

    // Get the product price from our products configuration
    const productPrice = getProductPrice(packageId);
    if (!productPrice) {
      throw new Error(`Product not found: ${packageId}`);
    }

    console.log(`Using price $${productPrice} for package: ${packageId}`);

    // Create PayPal order
    const paypalOrderBody = {
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: 'USD',
          value: productPrice.toString()
        }
      }],
      payment_source: {
        paypal: {
          experience_context: {
            payment_method_preference: "IMMEDIATE_PAYMENT_REQUIRED",
            landing_page: "NO_PREFERENCE",
            shipping_preference: "NO_SHIPPING",
            user_action: "PAY_NOW",
            return_url: `${backUrl}/api/games/confirmPurchase?package_id=${packageId}&user_hash=${userHash}&timezone=${timezone}&back_url=${backUrl}&site=${site}`,
            cancel_url: backUrl
          }
        }
      }
    };


    const paypalResponse = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(paypalOrderBody)
    });

    // Get the actual response data from PayPal
    const paypalData = await paypalResponse.json();

    if (paypalData.id) {
      // Find the PayPal approval URL from the response
      const approvalUrl = paypalData.links.find(link => link.rel === 'payer-action')?.href;
      
      if (approvalUrl) {
        return response.redirect(approvalUrl);
      } else {
        throw new Error('PayPal approval URL not found');
      }
    } else {
      throw new Error('Failed to create PayPal order: ' + JSON.stringify(paypalData));
    }

  } catch (error) {
    return response.status(500).json({ code: 1, error: 'Internal server error' });
  }
});

gameapiRouter.get('/confirmPurchase', async (request, response) => {
  try {
    const {
      package_id: packageId,
      user_hash: userHash,
      timezone,
      back_url: backUrl,
      site,
      token,
      PayerID
    } = request.query;


    if (!token) {
      return response.status(400).json({ code: 1, error: 'PayPal token is required' });
    }

      // Create purchase record with PayPal order ID
      await Purchase.create({
        userHash,
        packageId,
        created,
        consumed: false,
        site,
        timezone,
        backUrl,
        paypalOrderId: paypalData.id
      });
    

      // Redirect back to the game
      if (backUrl) {
        return response.redirect(backUrl);
      }

      return response.json({ 
        code: 0, 
        data: { 
          message: 'Payment successful!',
          orderId: token,
          status: 'COMPLETED'
        } 
      });
    } catch (error) {
    return response.status(500).json({ code: 1, error: 'Internal server error' });
  }
});

gameapiRouter.get('/setConsumed', async (request, response) => {
  const { user_hash: userHash, created } = request.query;
  if (!userHash || !created) {
    return response.status(400).json({ code: 1, error: 'user_hash and created are required' });
  }

  const result = await Purchase.updateOne(
    { userHash, created: Number(created), consumed: false },
    { $set: { consumed: true } },
  );

  if (result.matchedCount === 0) {
    return response.json({ code: 1, error: 'purchase not found or already consumed' });
  }

  return response.json({ code: 0 });
});

export default gameapiRouter;