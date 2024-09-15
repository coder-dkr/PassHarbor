const express = require('express');
const { MongoClient } = require('mongodb');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const cors = require('cors');
dotenv.config();


const app = express();
app.use(bodyParser.json());
const port = 4000;

app.use(cors({
    origin:["https://passharbor.vercel.app"],
    methods:["PATCH","GET","POST","DELETE"],
    credentials:true
}));


// Apply the CORS middleware with the defined options
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'https://passharbor.vercel.app'); // Restrict to your frontend origin
    res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS'); // Include OPTIONS for preflight
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With'); // Add necessary headers

    if (req.method === 'OPTIONS') {
        return res.status(200).end(); // Preflight request ends here
    }

    next(); // Continue with actual request for non-OPTIONS methods
});
// Connection URL
const url = 'mongodb+srv://dhruv:i6JLwBus0IevPj1o@myclustor.jamu8.mongodb.net/passharbor?retryWrites=true&w=majority&appName=myclustor';
const client = new MongoClient(url);

// Database name
const dbName = "passharbor";
const collectionName = "users";

// Connect to MongoDB
client.connect();

// Get all credentials for a specific email
app.get('/getbigdata', async (req, res) => {
    const email = req.headers.email;

    try {
        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        // Find the document by email
        const findResult = await collection.findOne({ email: email });
        if (!findResult || !findResult.credentials) {
            res.send({ credentials: [] }); // Return empty array if no credentials are found
        } else {
            res.send(findResult.credentials); // Return credentials for the specific email
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Error retrieving data');
    }
});


// Post data and insert it into the credentials array for a specific email
app.post('/save', async (req, res) => {
    const { email, credential } = req.body; // Expect email and credential data in the request body

    if (!email || !credential || !credential.site || !credential.username || !credential.password) {
        return res.status(400).send('Email and complete credential data (site, username, password) are required');
    }

    try {
        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        // Update the document by email, or create one if it doesn't exist
        const updateResult = await collection.updateOne(
            { email: email }, // Filter by email
            { $push: { credentials: credential } }, // Push new credential into the credentials array
            { upsert: true } // Create document if it doesn't exist
        );

        res.send({ success: true, updateResult });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error posting data');
    }
});

// Delete a specific credential by UUID
app.delete('/deletecredential', async (req, res) => {
    const email = req.headers.email; // Get email from headers
    const { id } = req.body; // Get UUID from the request body
  
    try {
      const db = client.db(dbName);
      const collection = db.collection(collectionName);
  
      // Pull the credential with the matching UUID from the credentials array
      const result = await collection.updateOne(
        { email: email },
        { $pull: { credentials: { id: id } } }  // Match by UUID
      );
  
      if (result.modifiedCount > 0) {
        res.status(200).send({ message: 'Credential deleted successfully' });
      } else {
        res.status(404).send({ message: 'Credential not found or already deleted' });
      }
    } catch (error) {
      res.status(500).send({ message: 'Error deleting credential', error });
    }
  });


  // PATCH route to edit credential
app.patch('/update-credential', async (req, res) => {
    const { email, credentialId, updatedCredential } = req.body;
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    try {
        // Update the specific credential in the credentials array
        const result = await collection.updateOne(
            { email: email, "credentials.id": credentialId },  // Filter by email and credential id
            {
                $set: {
                    "credentials.$.site": updatedCredential.site,
                    "credentials.$.username": updatedCredential.username,
                    "credentials.$.password": updatedCredential.password
                }
            }
        );

        
    } catch (error) {
        console.error('Error updating credential:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});
  

app.get('/',(req,res,next)=>{
    res.status(200).json({
      message:'good request'
    })
  })

app.listen(port, () => {
    console.log(`App listening on http://localhost:${port}`);
});
