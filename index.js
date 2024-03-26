import dotenv from 'dotenv';
import fetch from 'node-fetch';
import http from 'http';
import { URLSearchParams } from 'url'; // Import URLSearchParams for parsing query parameters

dotenv.config();

const WEBFLOW_API_TOKEN = process.env.WEBFLOW_API_TOKEN;
const PLACES_COLLECTION_ID = process.env.PLACES_COLLECTION_ID; // Assuming this is the Places collection ID
const USERS_COLLECTION_ID = process.env.USERS_COLLECTION_ID;

// Global error handlers for uncaught exceptions and unhandled promise rejections
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Function to post data to Webflow (for Places)
async function postDataToWebflow(lat, lng, address) {
  console.log('Attempting to post data to Webflow...');
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
      const errorData = await response.json();
      throw new Error(`Failed to save to CMS: ${response.statusText}, Details: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    console.log('Successfully saved to CMS:', data);
    return data; // Return the data for HTTP response
  } catch (error) {
    console.error('Error posting data to Webflow:', error);
    throw error; // Rethrow the error for HTTP response
  }
}

// Function to associate a User ID as an ownerID for a Place
async function associateUserWithPlace(placeId, ownerId) {
  const url = `https://api.webflow.com/collections/${COLLECTION_ID}/items/${placeId}?live=true`;

  try {
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${WEBFLOW_API_TOKEN}`,
        'Content-Type': 'application/json',
        'accept-version': '1.0.0'
      },
      body: JSON.stringify({
        fields: {
          'owner-id': ownerId, // Make sure this matches the field ID in your collection
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to associate user with place: ${response.statusText}, Details: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    console.log('Successfully associated user with place:', data);
    return data; // Return the data for HTTP response
  } catch (error) {
    console.error('Error associating user with place:', error);
    throw error; // Rethrow the error for HTTP response
  }
}

// Modify the HTTP server to handle new endpoints
const server = http.createServer(async (req, res) => {
  if (req.url === '/health') {
    res.writeHead(200);
    res.end('OK');
  } else if (req.url.startsWith('/post-data')) {
    const params = new URLSearchParams(req.url.split('?')[1]);
    const lat = params.get('lat');
    const lng = params.get('lng');
    const address = params.get('address');

    try {
      const data = await postDataToWebflow(lat, lng, address);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(data));
    } catch (error) {
      res.writeHead(500);
      res.end(`Error: ${error.message}`);
    }
  } else if (req.url.startsWith('/associate-user')) {
    const params = new URLSearchParams(req.url.split('?')[1]);
    const placeId = params.get('placeId');
    const ownerId = params.get('ownerId');

    try {
      const data = await associateUserWithPlace(placeId, ownerId);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(data));
    } catch (error) {
      res.writeHead(500);
      res.end(`Error: ${error.message}`);
    }
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
  console.log('Application started. Ready to receive requests...');
});