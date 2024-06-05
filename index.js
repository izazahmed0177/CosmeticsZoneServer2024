require("dotenv").config();
const express = require("express");

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const bodyParser = require('body-parser');
var jwt = require('jsonwebtoken');

const cors = require("cors");

const port = process.env.PORT;

app.use(cors());
app.use(bodyParser.json());
app.use(express.json());


// jwt use ===========


function createToken(user) {

  const token = jwt.sign(
    {
      email:user.email
    },

    "secret",

    { expiresIn: "7d" }
  );

  return token;
}
//------------


function verifyToken(req,res,next) {
  const authToken=req?.headers?.authorization;
  const authToken1=req?.headers
  console.log(authToken1);
  const token = authToken.split(' ')[1];
  
  console.log(authToken);
 
  const verify=jwt.verify(token,'secret');

  if (!verify?.email) {
    return res.send("you are not authorize")
    
  }
  req.user=verify.email;
  next()
}
//================


const uri = process.env.DATABASE_URL;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

//cosmeticsZone

async function run() {
  try {
    await client.connect();
    const cosmeticsZoneuserDB = client.db("cosmeticsZoneUserDB");


    const cosmeticsZoneUserCollection = cosmeticsZoneuserDB.collection(
      "cosmeticsZoneUserCollection"
    );
    
    const cosmeticsZoneCategoryCollection = cosmeticsZoneuserDB.collection(
      "cosmeticsCatagory"
    );

    const cosmeticsZoneCosmeticsCollection = cosmeticsZoneuserDB.collection(
      "cosmeticsDetail"
    );



    // user handaling cosmeticsZone

    //create user  cosmeticsZone
    app.post("/user", async (req, res) => {
      const user = req.body;
      const token=createToken(user);

      const isUserExist = await cosmeticsZoneUserCollection.findOne({
        email: user?.email,
      });

      if (isUserExist?._id) {
      
        return res.send({
          status: "success",
          message: "Log in success",
          token,
        });
      }
      await cosmeticsZoneUserCollection.insertOne(user);
       return res.send({token});
    });



    app.get("/user/:email", async (req, res) => {
      const email = req.params.email;
      const result = await cosmeticsZoneUserCollection.findOne({ email });
      res.send(result);
    });

    app.patch("/user/:email", verifyToken, async (req, res) => {
      const email = req.params.email;
      const userData = req.body;
      const result = await cosmeticsZoneUserCollection.updateOne(
        { email },
        { $set: userData },
        { upsert: true }
      );
      res.send(result);
    });




    // product routes all: 


    //catagory get  

    app.get("/catagory", async (req, res) => {
      const categoryData = cosmeticsZoneCategoryCollection.find();
      const result = await categoryData.toArray();
      res.send(result);
    });



    //product create

    app.post("/cosmetics",verifyToken, async (req, res) => {
      const cosmeticsData = req.body;
      const result = await cosmeticsZoneCosmeticsCollection.insertOne(cosmeticsData);
      res.send(result);
    });

        // product routes gat one
        app.get("/cosmetics/get/:id", async (req, res) => {
          const id = req.params.id;
    
          const cosmeticsData = await cosmeticsZoneCosmeticsCollection.findOne({
            _id: new ObjectId(id),
          });
          // const result=await shoesData.toArray();
          res.send(cosmeticsData);
        });

    //all product gate 
    app.get("/cosmetics", async (req, res) => {
      const cosmeticsData = cosmeticsZoneCosmeticsCollection.find();
      const result = await cosmeticsData.toArray();
      res.send(result);
    });


       // product routes patch update data
       app.patch("/cosmetics/edit/:id",verifyToken, async (req, res) => {
        const id = req.params.id;
        const updatedData = req.body;
  
        const result = await cosmeticsZoneCosmeticsCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: updatedData }
        );
        // const result=await shoesData.toArray();
        res.send(result);
      });


      app.delete("/cosmetics/delete/:id",verifyToken,async (req, res) => {
        const id = req.params.id;
        // const updatedData=req.body;
  
        const result = await cosmeticsZoneCosmeticsCollection.deleteOne({ _id: new ObjectId(id) });
        // const result=await shoesData.toArray();
        res.send(result);
      });

      /////////////

      ///////


      app.get('/categoryCosmetics/:category', async (req, res) => {

        const category = req.params.category;
        // const userData = req.body;



        // const id = req.params.id;
        let query = {category: category };

        let categoryCosmetics=cosmeticsZoneCosmeticsCollection.find(query) 
        const allcategory=await categoryCosmetics.toArray();           

        // const booking = await booksCollection.find(query);
        res.send(allcategory);
    })


    /////////////////////

app.get('/search', async (req, res) => {
  const { query } = req.query; // Get search query from request
  try {
    const results = await cosmeticsZoneCosmeticsCollection.find({
      $or: [
        { cosmeticsName: { $regex: query, $options: 'i' } },
        { title: { $regex: query, $options: 'i' } },
        { brand: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } },
        { cosmeticsDetails: { $regex: query, $options: 'i' } }
      ]
    }).toArray();
    res.json(results);
  } catch (error) {
    res.status(500).send(error.toString());
  }
});
  







    console.log("You successfully connected to MongoDB!");
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Route is working");
});

app.listen(port, (req, res) => {
  console.log("App is listening on port :", port);
});
