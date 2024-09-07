require('dotenv').config();  // Import and configure dotenv
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const bodyParser = require('body-parser');  // Import body-parser


const app = express();

app.use(cors());
app.use(bodyParser.json());  // Parse JSON bodies
app.use(bodyParser.urlencoded({ extended: true }));  // Parse URL-encoded bodies

// Use environment variables for Auth0 credentials
const auth0Domain = process.env.AUTH0_DOMAIN;
const clientId = process.env.AUTH0_CLIENT_ID;
const clientSecret = process.env.AUTH0_CLIENT_SECRET;

// Ensure the environment variables are loaded properly
if (!auth0Domain || !clientId || !clientSecret) {
  console.error('Error: Missing Auth0 environment variables.');
  process.exit(1);  // Exit the process if the environment variables are not properly set
}

app.delete('/delete-account', async (req, res) => {
  const { userId } = req.body;
  
  if (!userId) {
    return res.status(400).send({ message: 'User ID is required.' });
  }

  try {
    const tokenResponse = await axios.post(`https://${auth0Domain}/oauth/token`, {
      client_id: clientId,
      client_secret: clientSecret,
      audience: `https://${auth0Domain}/api/v2/`,
      grant_type: 'client_credentials',
    });

    const managementToken = tokenResponse.data.access_token;

    await axios.delete(`https://${auth0Domain}/api/v2/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${managementToken}`,
      },
    });

    res.status(200).send({ message: 'User deleted successfully.' });
  } catch (error) {
    console.error('Error deleting user:', error.response ? error.response.data : error.message);
    res.status(500).send({ message: 'Error deleting user.' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});
