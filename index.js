require('dotenv').config();

const fetch = require('node-fetch');
const WEBFLOW_API_TOKEN = process.env.WEBFLOW_API_TOKEN;
const COLLECTION_ID = process.env.COLLECTION_ID;

exports.handler = async (event) => {
  const { lat, lng, address } = JSON.parse(event.body);
  const url = `https://api.webflow.com/collections/${COLLECTION_ID}/items`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${WEBFLOW_API_TOKEN}`,
      'Content-Type': 'application/json',
      'accept-version': '1.0.0'
    },
    body: JSON.stringify({
      fields: {
        'name': 'Location Entry', // You might want to customize this
        'slug': 'location-entry-' + Date.now(), // Ensure uniqueness
        '_archived': false,
        '_draft': false,
        'latitude': lat,
        'longitude': lng,
        'address': address
      }
    })
  });

  if (!response.ok) {
    // Handle error
    return { statusCode: response.status, body: 'Failed to save to CMS' };
  }

  return { statusCode: 200, body: 'Successfully saved to CMS' };
};