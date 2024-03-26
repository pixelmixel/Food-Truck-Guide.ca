const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

app.post('/api/save-location', async (req, res) => {
  const { businessName, latitude, longitude, address } = req.body;
  // Construct the payload for Webflow CMS
  const payload = {
    fields: {
      name: businessName,
      slug: businessName.toLowerCase().replace(/ /g, '-').substring(0, 59), // Example slug generation
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
      throw new Error('Failed to save to Webflow CMS');
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