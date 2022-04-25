const express = require("express");
const app = express();

const cors = require("cors");
const { param } = require("express/lib/request");

const mongodb = require("mongodb");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const mongoClient = mongodb.MongoClient;
const URL = "mongodb://localhost:27017";
// const URL = "mongodb://0.0.0.0:27017";

app.use(
  cors({
    origin: "http://localhost:3000",
  })
);

app.use(express.json());
// let students = [];



function authenticate(req, res, next) {
  // Check token present in header
  if (req.headers.authorization) {
    let decode = jwt.verify(req.headers.authorization, 'asdf');
    if (decode) {
      req.userId = decode.id;
      next();
    } else {
      res.status(401).json({ message: 'Unauthorized' });
    }
  } else {
    res.status(401).json({ message: 'Unauthorized' });
  }}


app.get("/students", async (req, res) => {
  try {
    // Open the connction
    let connection = await mongoClient.connect(URL);
    //Select the DB
    let db = connection.db("32wdt");

    let students = await db.collection("students").find().toArray();
    await connection.close();
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: "somethig went wrong" });
    // await connection.close();
  }
});




app.post("/student", async (req, res) => {
  try {
    let connection = await mongoClient.connect(URL);

    let db = connection.db("32wdt");

    await db.collection("students").insertOne(req.body);

    await connection.close();

    res.json({ message: "student added" });
  } catch (error) {
    res.status(500).json({ message: "somethig went wrong" });
  }
});



app.put("/student/:id", async (req, res) => {
  try {
    let connection = await mongoClient.connect(URL);

    let db = connection.db("32wdt");

    //  await db.collection("students").updateOne({_id:req.params.id},{$set: req.body})
    //                                 Converting string id into Object id

    await db
      .collection("students")
      .updateOne({ _id: mongodb.ObjectId(req.params.id) }, { $set: req.body });

    await connection.close();

    res.json({ message: "student updated" });
  } catch (error) {
    res.status(500).json({ message: "somethig went wrong" });
  }
});



app.delete("/student/:id", async (req, res) => {
  try {
    let connection = await mongoClient.connect(URL);

    let db = connection.db("32wdt");

    //  await db.collection("students").updateOne({_id:req.params.id},{$set: req.body})
    //                                 Converting string id into Object id

    await db
      .collection("students")
      .deleteOne({ _id: mongodb.ObjectId(req.params.id) });

    await connection.close();

    res.json({ message: "student deleted" });
  } catch (error) {
    res.status(500).json({ message: "somethig went wrong" });
  }
});



app.get("/student/:id", async (req, res) => {
  try {
    // Open the connction
    let connection = await mongoClient.connect(URL);
    //Select the DB
    let db = connection.db("32wdt");

    let stu = await db
      .collection("students")
      .findOne({ _id: mongodb.ObjectId(req.params.id) });
    await connection.close();
    res.json(stu);
  } catch (error) {
    res.status(500).json({ message: "somethig went wrong" });
    await connection.close();
  }
});



app.post("/register", async (req, res) => {
  try {
    let connection = await mongoClient.connect(URL);
    //Select the DB
    let db = connection.db("32wdt");

    let salt = bcrypt.genSaltSync(10);
    var hash = bcrypt.hashSync(req.body.password, salt);
    req.body.password = hash;

    await db.collection("users").insertOne(req.body);
    await connection.close();

    res.json({ message: "User Created" });
  } catch (error) {
    res.status(500).json({ message: "somethig went wrong" });
  }
});



app.post("/login", async (req, res) => {
  try {
    let connection = await mongoClient.connect(URL);

    let db = connection.db("32wdt");

    let user = await db.collection("users").findOne({ email: req.body.email });
    if (user) {
      let compare = bcrypt.compareSync(req.body.password, user.password);
      if (compare) {
       let token= jwt.sign({ name: user.name, id: user._id }, "asdf");

        res.json({ token});
      } else {
        res.status(500).json({ message: "Passowrd not match" });
      }
    } else {
      res.status(401).json({ message: "No user found " });
    }

    await connection.close();
  } catch (error) {}
});



app.listen(process.env.PORT || 3005, () => {
  console.log("web server connected");
});
