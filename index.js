import dotenv from 'dotenv';
import fetch from 'node-fetch';
import http from 'http';

dotenv.config();

const WEBFLOW_API_TOKEN = process.env.WEBFLOW_API_TOKEN;
const COLLECTION_ID = process.env.COLLECTION_ID; // Assuming this is the Places collection ID

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
  } catch (error) {
    console.error('Error posting data to Webflow:', error);
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
  } catch (error) {
    console.error('Error associating user with place:', error);
  }
}

// Basic HTTP server for health check endpoint
const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200);
    res.end('OK');
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
  console.log('Application started. Ready to receive requests...');
});

// Example usage (uncomment and replace with actual data to use)
// postDataToWebflow('45.4215', '-75.6972', 'Example Address');
// associateUserWithPlace('place_item_id', 'user_item_id');
