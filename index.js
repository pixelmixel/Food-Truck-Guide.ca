import express from 'express';
import bodyParser from 'body-parser';
import fetch from 'node-fetch';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

app.post('/api/save-location', async (req, res) => {
  const { businessName, address, lat, long } = req.body; // Change 'lng' to 'long' here

  // Generate slug from businessName
  const slug = businessName.trim().includes(' ')
                ? businessName.toLowerCase().replace(/\s+/g, '-').substring(0, 59)
                : businessName.toLowerCase();

  const PLACES_COLLECTION_ID = process.env.PLACES_COLLECTION_ID;
  const WEBFLOW_API_TOKEN = process.env.WEBFLOW_API_TOKEN;

  // Ensure address is treated as a string
  const addressAsString = String(address);

  // Prepare the payload with mandatory fields
  const payload = {
    fields: {
      name: businessName,
      slug: slug, // Correctly defined slug
      _archived: false,
      _draft: false,
      address: addressAsString, // Correctly defined addressAsString
      lat: parseFloat(lat), // Assuming lat is the field name in Webflow and converting to float
      long: parseFloat(long), // Correctly use 'long' here and converting to float
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

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
