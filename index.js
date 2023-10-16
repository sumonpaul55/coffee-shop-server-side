const express = require("express")
const cors = require("cors")
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
const port = process.env.PORT || 5000;

// setting the middleware
app.use(cors())
app.use(express.json())
// coffeeMaster
// cykP4wmLi7H3qPGv
const user = process.env.DB_USER
const pass = process.env.DB_PASS
const uri = `mongodb+srv://${user}:${pass}@cluster0.nrfwsc1.mongodb.net/?retryWrites=true&w=majority`;
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
    // await client.connect();
    // Get the database and collection on which to run the operation
    const coffeCollection = client.db("coffeeDB").collection("coffee");
    const usersCollections = client.db("coffeeDB").collection("users")
    // read data from database
    app.get("/coffee", async (req, res) => {
      const cursor = coffeCollection.find();
      const result = await cursor.toArray();
      res.send(result)
    })
    // target the specific coffe with id
    app.get("/coffee/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await coffeCollection.findOne(query)
      res.send(result)
    })
    //  const foods = database.collection("foods");
    app.post("/coffee", async (req, res) => {
      const newCoffee = req.body;
      const result = await coffeCollection.insertOne(newCoffee)
      res.send(result)
    })
    // update operation code
    app.put("/coffee/:id", async (req, res) => {
      const targetCoffe = req.params.id;
      const filter = { _id: new ObjectId(targetCoffe) }
      const options = { upsert: true }
      const updateCoffee = req.body;
      const coffee = {
        $set: {
          name: updateCoffee.name, quantity: updateCoffee.quantity, supplier: updateCoffee.supplier, taste: updateCoffee.taste, category: updateCoffee.category, detail: updateCoffee.detail, photo: updateCoffee.photo
        }
      }
      const result = await coffeCollection.updateOne(filter, coffee, options)
      res.send(result)
    })

    // delete operations will go here
    app.delete("/coffee/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await coffeCollection.deleteOne(query)
      res.send(result)
    })
    //user related apis
    // read and get data from database
    app.get("/users", async (req, res) => {
      const cursor = await usersCollections.find().toArray();
      res.send(cursor)
    })

    // update logged in time in data base when login.

    app.patch("/loggedInusers", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const userDocs = {
        $set: {
          lastLoggedIngAt: user.lastLoggedIn
        }
      }
      const result = await usersCollections.updateOne(filter, userDocs)
      res.send(result)
    })

    // add users to database after created account
    app.post("/user", async (req, res) => {
      const newUsers = req.body;
      const result = await usersCollections.insertOne(newUsers)
      res.send(result)
    })
    // For delete an users from dataBase
    app.delete("/deleteUser/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await usersCollections.deleteOne(query)
      res.send(result)

    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.log);

app.listen(port, () => {
  console.log(`Coffee server Run port ${port}`)
})