const express = require('express');
const axios = require('axios');
const { google } = require('googleapis');
const dotenv = require('dotenv');
const app = express();

dotenv.config();

const GOOGLE_CLIENT_ID = '581386274432-55uu4p62ml1jai4uvja82d2n3ref9ies.apps.googleusercontent.com';
const GOOGLE_CLIENT_SECRET = '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';
const REDIRECT_URI = 'http://localhost:3001/api/auth/google-callback';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'http://localhost:3000/api/vendors/google-callback'
);

// Generate the URL that will be used for the consent dialog.
const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: [
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email'
  ]
});

console.log('Authorize this app by visiting this url:', authUrl);

// Serve a simple HTML page with Google login button
app.get('/', (req, res) => {
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${GOOGLE_CLIENT_ID}&` +
    `redirect_uri=${REDIRECT_URI}&` +
    `response_type=code&` +
    `scope=email profile&` +
    `access_type=offline&` +
    `prompt=consent`;

  res.send(`
    <html>
      <body>
        <h1>Google OAuth Test</h1>
        <a href="${authUrl}">
          <button>Login with Google</button>
        </a>
      </body>
    </html>
  `);
});

// Handle the callback
app.get('/api/auth/google-callback', async (req, res) => {
  const { code } = req.query;

  try {
    // Exchange code for tokens
    const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
      grant_type: 'authorization_code'
    });

    const { access_token, id_token } = tokenResponse.data;

    // Display the tokens
    res.send(`
      <html>
        <body>
          <h1>Tokens Received</h1>
          <h3>Access Token:</h3>
          <pre>${access_token}</pre>
          <h3>ID Token:</h3>
          <pre>${id_token}</pre>
          <p>Use the ID Token for testing the Google login API.</p>
          <a href="/">
            <button>Back to Login</button>
          </a>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('Error getting tokens:', error.response?.data || error.message);
    res.status(500).send('Error getting tokens');
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Test server running at http://localhost:${PORT}`);
  console.log('Visit http://localhost:3001 to get your Google OAuth token');
}); 