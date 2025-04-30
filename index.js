const express = require('express');
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();

//middlewares
app.use(express.json());
app.use(cors());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jpi5bfv.mongodb.net/?appName=Cluster0`;


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

    //create database and db collection for your coffee store
    const database = client.db("CoffeeStoreDB");
    const coffeeCollection = database.collection("coffee");
    const usersCollection = client.db("CoffeeStoreDB").collection("coffeeStoreUsers");

    app.get('/coffee', async (req, res) => {
      const cursor = coffeeCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    app.get('/coffee/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await coffeeCollection.findOne(query);
      res.send(result);
    })

    app.post('/coffee', async (req, res) => {
      const newCoffee = req.body;
      const result = await coffeeCollection.insertOne(newCoffee);
      res.send(result);
    })

    app.delete('/coffee/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await coffeeCollection.deleteOne();
      res.send(result);
    })

    app.put('/coffee/:id', async (req, res) => {
      const id = req.params.id;
      const newCoffee = req.body;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const query = {
        $set: {
          name: newCoffee.name,
          quantity: newCoffee.quantity,
          supplier: newCoffee.supplier,
          taste: newCoffee.taste,
          photo: newCoffee.photo,
          category: newCoffee.category,
          details: newCoffee.details
        }
      }
      const result = await coffeeCollection.updateOne(filter, query, options);
      res.send(result);
    })

    //users related apis

    app.get('/users', async (req, res) => {
      const cursor = usersCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    app.post('/users', async (req, res) => {
      const newUser = req.body;
      console.log('creating new user', newUser);
      const result = await usersCollection.insertOne(newUser);
      res.send(result);
    })

    app.patch('/users/', async (req, res) => {
      const email = req.body.email;
      const filter = { email };
      const updatedDoc = {
        $set: {
          lastSignInTime: req.body?.lastSignInTime
          
        }
      }
      const result = await usersCollection.updateOne(filter, updatedDoc);
      res.send(result);
    })

    app.delete('/users/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = usersCollection.deleteOne(query);
      console.log(result);
      res.send(result);
    })

  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Coffee Store Server is Running');
})

app.listen(port, () => {
  console.log(`Coffee Store Server is running at Port: ${port}`);
})