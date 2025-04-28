import express from "express";
import cors from "cors";
import 'dotenv/config';
import { MongoClient, ObjectId, ServerApiVersion } from "mongodb"

const app = express()
const port = process.env.PORT || 5000;

// middleware
app.use(cors())
app.use(express.json())

// coffeeMaster
// z0JCWBHoLBiYnYlh

const uri = process.env.MONGO_URI;

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
        const coffeeCollection = client.db("coffeeDB").collection("coffeeCollection");
        const usersCollection = client.db("coffeeDB").collection("usersCollection")

        app.get('/coffee', async (req, res) => {
            const cursor = coffeeCollection.find()
            const result = await cursor.toArray()
            res.send(result)
        })

        app.get('/coffee/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const coffee = await coffeeCollection.findOne(query);
            res.send(coffee)
        })

        app.post('/coffee', async (req, res) => {
            const newCoffee = req.body;
            const insertedCoffee = await coffeeCollection.insertOne(newCoffee)
            res.send(insertedCoffee)
        })

        app.put('/coffee/:id', async (req, res) => {
            const id = req.params.id;
            const updatedCoffee = req.body;
            const filter = { _id: new ObjectId(id) }
            const options = { upsert: true }
            const coffee = {
                $set: {
                    name: updatedCoffee.name,
                    quantity: updatedCoffee.quantity,
                    supplier: updatedCoffee.supplier,
                    taste: updatedCoffee.taste,
                    category: updatedCoffee.category,
                    details: updatedCoffee.details,
                    photo: updatedCoffee.photo

                }
            }
            const result = await coffeeCollection.updateOne(filter, coffee, options);
            res.send(result)
        })

        app.delete('/coffee/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await coffeeCollection.deleteOne(query)
            res.send(result)
        })

        // Users related api & database
        app.post('/users', async (req, res) => {
            const newUser = req.body;
            console.log('creating new user', newUser);
            const insertedUser = await usersCollection.insertOne(newUser)
            res.send(insertedUser)
        })

        app.get('/users', async (req, res) => {
            const result = await usersCollection.find().toArray()
            res.send(result)
        })

        app.patch('/users', async (req, res) => {
            const email = req.body.email;
            const filter = { email }
            const updatedUser = {
                $set: {
                    lastSignInTime: req.body?.lastSignInTime,
                }
            }
            const result = await usersCollection.updateOne(filter, updatedUser)
            res.send(result)
            console.log(result);
        })

        app.delete('/users/:id', async (req, res) => {
            const id = req.params.id;
            console.log('delete id:', id);
            const query = { _id: new ObjectId(id) }
            const result = await usersCollection.deleteOne(query)
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
run().catch(console.dir);




app.get('/', (req, res) => {
    res.send('Coffee making server is running.')
})

app.listen(port, () => {
    console.log(`Coffee server is running on port: ${port}`);
})