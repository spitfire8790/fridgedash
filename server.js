const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const app = express();

app.use(cors());

const API_KEY = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJqdGkiOiIyMzJSVG0yQS1WcUJyQkxvVHozcVpLWVZ1RGlIR210a0xFRW9yZGNrakxNIiwiaWF0IjoxNzMxMTIzMzQ0fQ.FroOt8o04De137nHKWaXMtd2WMCtL56aSAMtyHz6Nu4';

app.get('/api/transport', async (req, res) => {
    try {
        const { latitude, longitude } = req.query;
        const response = await fetch(
            `https://api.transport.nsw.gov.au/v1/tp/departure_mon?outputFormat=rapidJSON&coordOutputFormat=EPSG:4326&mode=direct&type_dm=stop&name_dm=${latitude},${longitude}&radius_dm=1000&TfNSWDM=true`,
            {
                headers: {
                    'Authorization': `apikey ${API_KEY}`,
                    'Accept': 'application/json'
                }
            }
        );
        
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to fetch transport data' });
    }
});

app.listen(3000, () => {
    console.log('Proxy server running on http://localhost:3000');
});