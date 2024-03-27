import express from 'express';
import bodyParser from 'body-parser';
import fetch from 'node-fetch';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

app.post('/api/save-location', async (req, res) => {
  const { businessName, latitude, longitude, address } = req.body;
  const PLACES_COLLECTION_ID = process.env.PLACES_COLLECTION_ID;
  const WEBFLOW_API_TOKEN = process.env.WEBFLOW_API_TOKEN;

  const payload = {
    fields: {
      name: businessName,
      slug: businessName.toLowerCase().replace(/ /g, '-').substring(0, 59),
      _archived: false,
      _draft: false,
      latitude: parseFloat(latitude), // Ensure this is a number
      longitude: parseFloat(longitude), // Ensure this is a number
      address: address
    }
  };

  try {
    if (isNaN(parseFloat(latitude)) || isNaN(parseFloat(longitude))) {
      return res.status(400).json({ success: false, error: "Invalid latitude or longitude" });
    }
    
    const response = await fetch(`https://api.webflow.com/collections/${PLACES_COLLECTION_ID}/items`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WEBFLOW_API_TOKEN}`,
        'Content-Type': 'application/json',
        'accept-version': '1.0.0'
      },
      body: JSON.stringify(payload)
    });
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

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
