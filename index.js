import express from 'express';
import bodyParser from 'body-parser';
import fetch from 'node-fetch';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

app.post('/api/save-location', async (req, res) => {
  const { businessName, address /*, latitude, longitude */ } = req.body;

  const PLACES_COLLECTION_ID = process.env.PLACES_COLLECTION_ID;
  const WEBFLOW_API_TOKEN = process.env.WEBFLOW_API_TOKEN;

  // Convert address to a string to ensure it's correctly formatted
  const addressAsString = String(address);

  // Create slug: replace spaces with hyphens only if there's more than one word
  const slug = businessName.trim().includes(' ') 
                ? businessName.toLowerCase().replace(/\s+/g, '-').substring(0, 59) 
                : businessName.toLowerCase();

  // Prepare the payload with mandatory fields
  const payload = {
    fields: {
      name: businessName,
      slug: slug,
      _archived: false,
      _draft: false,
      address: addressAsString,
      // Temporarily comment out latitude and focus on longitude
      // latitude: "-80.025173", // Hardcoded value for testing
      longitude: "-80.025173", // Hardcoded value for testing
    }
  };

  console.log('Making request to Webflow API with payload:', payload);

  try {
    const response = await fetch(`https://api.webflow.com/collections/${PLACES_COLLECTION_ID}/items`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WEBFLOW_API_TOKEN}`,
        'Content-Type': 'application/json',
        'accept-version': '1.0.0'
      },
      body: JSON.stringify(payload)
    });

    console.log('Received response with status:', response.status);

    if (!response.ok) {
      const errorBody = await response.json();
      console.error('Error saving to Webflow CMS:', errorBody);
      res.status(response.status).json({ success: false, error: errorBody });
      return;
    }

    const data = await response.json();
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Error saving to Webflow CMS:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});