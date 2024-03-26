import express from 'express';
import bodyParser from 'body-parser';
import fetch from 'node-fetch';

const app = express();
const PORT = process.env.PORT || 3000;

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
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      address: address
    }
  };

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

    if (!response.ok) {
      throw new Error(`Failed to save to Webflow CMS: ${response.statusText}`);
    }

    const data = await response.json();
    res.status(200).json({ success: true, data: data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});