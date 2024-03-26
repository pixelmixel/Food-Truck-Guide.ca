import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const WEBFLOW_API_TOKEN = process.env.WEBFLOW_API_TOKEN;
const COLLECTION_ID = process.env.COLLECTION_ID;

// Example function to demonstrate usage
async function postDataToWebflow(lat, lng, address) {
  const url = `https://api.webflow.com/collections/${COLLECTION_ID}/items`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WEBFLOW_API_TOKEN}`,
        'Content-Type': 'application/json',
        'accept-version': '1.0.0'
      },
      body: JSON.stringify({
        fields: {
          'name': 'Location Entry',
          'slug': 'location-entry-' + Date.now(),
          '_archived': false,
          '_draft': false,
          'latitude': lat,
          'longitude': lng,
          'address': address
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to save to CMS: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Successfully saved to CMS:', data);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Example usage
// postDataToWebflow('45.4215', '-75.6972', 'Example Address');