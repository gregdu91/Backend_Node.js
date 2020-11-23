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
    console.log('I have received a post request in the /animal route');
    //create a animals object
    let animals = new Animals(req.body.name, req.body.size, req.body.numberOfLegs, req.body.color, req.body.species, req.body.birth)
    //insert the new object into to the database
    animalsDb.insertOne(animals)
    res.sendStatus(200)
})


// Animals router to delete
app.delete('/animals', (req, res) =>{

    console.log('Animals router to delete animals');

    animalsDb.deleteOne({"_id": ObjectId(req.body.id)})

    //find the animal by id 
    async function findAnimals() {
        const foundAnimals = await  animalsDb.findOne({"_id": ObjectId(req.body.id)})

        // send a message to the user if is was not working
        if(foundAnimals !== null){
            res.send("The entry was not deleted")
        }
        //// send a message to the user if is was working
        res.send("The entry was deleted")
    }
    findAnimals();
})

// Animals router for the update
app.put('/animals', (req, res) => {
    console.log(' Animals router for update ');
    async function findAnimals() {
        try{
            const foundAnimals = await  animalsDb.findOne({"_id": ObjectId(req.body.id)})
            
            //if the animals is found edit it and send a message to the user
                if(foundAnimals !== null){
                    let animals = new Animals(foundAnimals.name, foundAnimals.size, foundAnimals.numberOfLegs, foundAnimals.color, foundAnimals.species, foundAnimals.birth)

                    animals.name = req.body.name;

                try{
                    await animalsDb.updateOne(
                        {"_id": ObjectId(req.body.id)},
                        {$set:animals});
                } catch(err){
                    console.log(err.stack)
                }
                res.send("The animals were updated");
            } else {
                //if the animals is not found send a message to the user saying that this entry doe not exist
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

    constructor(name, size, numberOfLegs, color, species, birth) {
        this.name = name;
        this.size = size;
        this.numberOfLegs = numberOfLegs;
        this.color = color;
        this.species = species;
        this.birth = birth;
    }

    printValues(){
        console.log(this.name, this.size, this.numberOfLegs, this.color, this.species, this.birth);
    }
}
