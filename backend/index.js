const express = require('express');
const { MongoClient } = require('mongodb');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const cors = require('cors');
dotenv.config();


const app = express();
app.use(bodyParser.json());
const port = 4000;

const corsOptions = {
    origin: ["https://passharbor.vercel.app"],
    methods: ["GET", "POST", "PATCH", "DELETE"],
    credentials: true,
    allowedHeaders: ["Content-Type", "X-Requested-With", "email"],
    optionsSuccessStatus: 200,
    preflightContinue: false,
};


app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'https://passharbor.vercel.app'); 
    res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE'); 
    res.header('Access-Control-Allow-Headers', "*");
    res.header('Access-Control-Allow-Credentials',true);

    if (req.method === 'OPTIONS') {
        return res.status(200).end(); 
    }

    next(); 
});

// Apply the CORS middleware globally
app.use(cors(corsOptions));



const url = 'mongodb+srv://dhruv:i6JLwBus0IevPj1o@myclustor.jamu8.mongodb.net/passharbor?retryWrites=true&w=majority&appName=myclustor';
const client = new MongoClient(url);

// Database 
const dbName = "passharbor";
const collectionName = "users";


client.connect();

// Get 
app.get('/getbigdata', async (req, res) => {
    const {email} = req.body

    try {
        const db = client.db(dbName);
        const collection = db.collection(collectionName);

       
        const findResult = await collection.findOne({ email: email });
        if (!findResult || !findResult.credentials) {
            res.send({ credentials: [] }); 
        } else {
            res.send(findResult.credentials); 
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Error retrieving data');
    }
});


// Post
app.post('/save', async (req, res) => {
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
        console.error(err);
        res.status(500).send('Error posting data');
    }
});

// Delete
app.delete('/deletecredential', async (req, res) => { 
    const { id , email} = req.body; 
  
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


  // PATCH
app.patch('/update-credential', async (req, res) => {
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
