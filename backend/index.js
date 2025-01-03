const express = require('express');
const { MongoClient } = require('mongodb');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
app.use(bodyParser.json());
const port = 4000;

const url = "mongodb+srv://dhruv:DfxE7KRWi1Ekydxv@passharborstore.zgc6e.mongodb.net/passharbor?retryWrites=true&w=majority&appName=passharborstore"; 
const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });

// Database 
const dbName = "passharbor";
const collectionName = "users";

// MongoDB Connection with error handling
client.connect()
    .then(() => {
        console.log("Connected to MongoDB");
    })
    .catch(err => {
        console.error("MongoDB connection error: ", err);
    });

// Create an index on email field for better query performance
const createEmailIndex = async () => {
    try {
        const db = client.db(dbName);
        const collection = db.collection(collectionName);
        await collection.createIndex({ email: 1 });
        console.log("Index created on 'email' field");
    } catch (error) {
        console.error("Error creating index:", error);
    }
};
createEmailIndex();

// Get route with query parameter for email
app.get('/api/getbigdata', async (req, res) => {
    const { email } = req.query;  // Use req.query to access email parameter from URL

    if (!email) {
        return res.status(400).send("Email is required");
    }

    try {
        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        const findResult = await collection.findOne({ email: email });
        if (!findResult || !findResult.credentials) {
            return res.send({ credentials: [] });
        } else {
            return res.send(findResult.credentials);
        }
    } catch (err) {
        console.error("Error retrieving data:", err);
        res.status(500).send('Error retrieving data');
    }
});

// Post route for saving credentials
app.post('/api/save', async (req, res) => {
    const { email, credential } = req.body;

    if (!email || !credential || !credential.site || !credential.username || !credential.password) {
        return res.status(400).send('Email and complete credential data (site, username, password) are required');
    }

    try {
        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        const updateResult = await collection.updateOne(
            { email: email },
            { $push: { credentials: credential } },
            { upsert: true }
        );

        res.send({ success: true, updateResult });
    } catch (err) {
        console.error("Error posting data:", err);
        res.status(500).send('Error posting data');
    }
});

// Delete route for removing a credential
app.delete('/api/deletecredential', async (req, res) => {
    const { id, email } = req.body;

    try {
        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        const result = await collection.updateOne(
            { email: email },
            { $pull: { credentials: { id: id } } }
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

// Patch route for updating credentials
app.patch('/api/update-credential', async (req, res) => {
    const { email, credentialId, updatedCredential } = req.body;
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    try {
        const result = await collection.updateOne(
            { email: email, "credentials.id": credentialId },
            {
                $set: {
                    "credentials.$.site": updatedCredential.site,
                    "credentials.$.username": updatedCredential.username,
                    "credentials.$.password": updatedCredential.password
                }
            });

        if (result.modifiedCount > 0) {
            res.status(200).json({ success: true, message: 'Credential updated successfully' });
        } else {
            res.status(404).json({ success: false, message: 'Credential not found' });
        }

    } catch (error) {
        console.error('Error updating credential:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Basic route to check server status
app.get('/', (req, res) => {
    res.status(200).json({
        message: 'good request'
    });
});

// Start the server
app.listen(port, () => {
    console.log(`App listening on http://localhost:${port}`);
});
