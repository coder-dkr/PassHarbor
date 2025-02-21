const express = require('express');
const { MongoClient } = require('mongodb');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const cors = require('cors')
dotenv.config();

const app = express();
app.use(bodyParser.json());
const port = process.env.PORT || 2344;  // Allow flexibility

const corsOptions = {
    origin : ["http://localhost:5173"],
    optionsSuccessStatus : 200
}

app.use(cors(corsOptions))

// const url = "mongodb+srv://dhruv:DfxE7KRWi1Ekydxv@passharborstore.zgc6e.mongodb.net/passharbor?retryWrites=true&w=majority&appName=passharborstore";
const url = process.env.MONGO_URI
const client = new MongoClient(url);

const dbName = "passharbor";
const collectionName = "users";

async function connectDB() {
    try {
        await client.connect();
        console.log("✅ Connected to MongoDB");

        
        const db = client.db(dbName);
        const collection = db.collection(collectionName);
        await collection.createIndex({ email: 1 });
    } catch (error) {
        console.error("❌ MongoDB connection error:", error);
        process.exit(1);  // Exit if connection fails
    }
}

connectDB();

// Get user credentials
app.get('/api/getbigdata', async (req, res) => {
    const {email}  = req.headers;

    if (!email) return res.status(400).send("❌ Email is required");

    try {
        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        const user = await collection.findOne({ email });
        res.send(user?.credentials || []);
    } catch (err) {
        console.error("❌ Error retrieving data:", err);
        res.status(500).send('Error retrieving data');
    }
});

// Save credentials
app.post('/api/save', async (req, res) => {
    const { email, credential } = req.body;

    if (!email || !credential?.site || !credential?.username || !credential?.password) {
        return res.status(400).send('❌ Email and complete credential data are required');
    }

    try {
        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        const updateResult = await collection.updateOne(
            { email },
            { $push: { credentials: credential } },
            { upsert: true }
        );

        res.send({ success: true, updateResult });
    } catch (err) {
        console.error("❌ Error saving data:", err);
        res.status(500).send('Error saving data');
    }
});

// Delete credential
app.delete('/api/deletecredential', async (req, res) => {
    const {email , id } = req.headers;


    if (!id || !email) {
        return res.status(400).send({ message: '❌ Both email and id are required' });
    }

    try {
        const db = client.db(dbName);
        const collection = db.collection(collectionName);
        const result = await collection.updateOne(
            { email },
            { $pull: { credentials: { id : id } } }
        );

        if (result.modifiedCount > 0) {
            res.status(200).send({ message: '✅ Credential deleted successfully' });
        } else {
            res.status(404).send({ message: '❌ Credential not found' });
        }
    } catch (error) {
        res.status(500).send({ message: '❌ Error deleting credential', error });
    }
});

// Update credentials
app.patch('/api/update-credential', async (req, res) => {
    const { email, credentialId, updatedCredential } = req.body;

    try {
        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        const result = await collection.updateOne(
            { email, "credentials.id": credentialId },
            { $set: { "credentials.$": updatedCredential } }
        );

        if (result.modifiedCount > 0) {
            res.status(200).json({ success: true, message: '✅ Credential updated successfully' });
        } else {
            res.status(404).json({ success: false, message: '❌ Credential not found' });
        }
    } catch (error) {
        console.error('❌ Error updating credential:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Check server status
app.get('/', (req, res) => {
    res.status(200).json({ message: '✅ Server is running' });
});

// Graceful Shutdown
process.on('SIGINT', async () => {
    console.log("\n🔻 Closing MongoDB connection...");
    await client.close();
    console.log("✅ MongoDB connection closed");
    process.exit(0);
});

// Start the server
app.listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}`);
});
