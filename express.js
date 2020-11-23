const express = require("express");
const app = express();
const { MongoClient, ObjectId } = require("mongodb");

// url of my cluster
const url = "mongodb+srv://cardeal:root@cluster0.sllja.mongodb.net/animal?retryWrites=true&w=majority";
const client = new MongoClient(url, { useUnifiedTopology: true });
// name of my database
const dbName = "animal";

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: false}))

let db, animalsDb;

//home page route
app.get('/', (req, res) => {

    res.send('Hello there !')

})

//get animal router
app.get('/animals', (req, res) => {
    console.log('You are in the animal route');

    //Get all the animals in the database
    async function findAnimals() {
        const foundAnimals = await  animalsDb.find().toArray()
        res.json(foundAnimals)
    };
    findAnimals();
})

//Get one animal by id
app.get('/animals/:id', (req, res) => {

    async function findOneAnimals() {
        const foundOneAnimals = await animalsDb.findOne({"_id": ObjectId(req.params.id)})
        res.json(foundOneAnimals);
    }
    findOneAnimals();

})

//post animal route
app.post('/animals', (req, res) =>{
    console.log('I have received a post request in the /animals route');
    //create a new animal object
    let animal = new Animals(req.body.name, req.body.size, req.body.color, req.body.species, req.body.availability)
    //insert the new object to the database
    animalsDb.insertOne(animal)
    res.sendStatus(200)

})

//delete animal route
app.delete('/animals', (req, res) =>{

    console.log('Animals router to delete shoes');
    //Find the animal data who has the id
    animalsDb.deleteOne({"_id": ObjectId(req.body.id)})

    async function findAnimals() {
        const foundAnimals = await  animalsDb.findOne({"_id": ObjectId(req.body.id)})
        // send a message to the user if the delete didn't work
        if(foundAnimals !== null){
            res.send("The entry was not deleted")
        }
        //// send a message to the user if the delete work
        res.send("The entry was deleted")
    }
    findAnimals();
})

//put animal route
app.put('/animals', (req, res) => {
    console.log(' Animals router for update ');
    async function findAnimals() {
        try{
            //find the animals data who has the same id
            const foundAnimals = await  animalsDb.findOne({"_id": ObjectId(req.body.id)})
            if(foundAnimals !== null){
                //Create the new animals object for update
                let animal = new Animals(foundAnimals.name, foundAnimals.size, foundAnimals.color, foundAnimals.species, foundAnimals.availability)

                animal.name = req.body.name;
                animal.size = req.body.size;
                animal.color = req.body.color;
                animal.species = req.body.species;
                animal.availability = req.body.availability;


                try{
                    await animalsDb.updateOne(
                        {"_id": ObjectId(req.body.id)},
                        {$set:animal});
                } catch(err){
                    console.log(err.stack)
                }
                // send a message to the user if the update work
                res.send("The animals were updated");
            } else {
                //if the animals are not found send a message to the user saying that this entry doe not exist
                res.send("The animals were not updated");
            }}catch(err){
            res.send("Object id is invalid")
        }
    }
    findAnimals();
})



//Code used to start our application
async function run() {
    // try to start the application only if the database is connected correctly
    try {
        //connect to the database
        await client.connect();
        console.log("Connected correctly to server");
        //connect to the right database ("animal")
        db = client.db(dbName);

        //get reference to our animals collection
        animalsDb = db.collection("animals");

        //start listening to requests (get/post/etc.)
        app.listen(3000);
    } catch (err) {
        //in case we couldn't connect to our database throw the error in the console
        console.log(err.stack);
    }
}

run().catch(console.dir);

class Animals {

    constructor(name, size, numberOfLegs, color, species, availability = false) {
        this.name = name;
        this.size = size;
        this.color = color;
        this.species = species;
        this.availability = availability
    }

}
