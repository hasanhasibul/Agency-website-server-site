const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const fileUpload = require('express-fileupload');
// middleware
app.use(cors());
app.use(bodyParser.json());
app.use(fileUpload())


// mongodb connection method 
const { MongoClient, ChangeStream } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const uri = "mongodb+srv://parlour:parlour123@cluster0.ezexp.mongodb.net/parlour?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const adminCollection = client.db("parlour").collection("admin");
  const serviceCollection = client.db("parlour").collection("service");
  const reviewCollection = client.db("parlour").collection("review");
  const paymentDetailsCollection = client.db("parlour").collection("paymentDetails");
  // perform actions on the collection object
  console.log("database connection successfully");

  app.post('/admin', (req, res) => {
    const email = req.body.email
    console.log(email);
    adminCollection.insertOne({ email: email })
      .then(result => {
        if (result) {
          // console.log(result);
          res.send(result)
        }
      })
  })

  app.post('/addService', (req, res) => {
    const file = req.files.file.data;
    const title = req.body.title;
    const price = req.body.price;
    const des = req.body.des;

    const newImg = req.files.file.data;
    console.log(newImg);
    const encImg = newImg.toString('base64');

    const image = {
      contentType: req.files.file.mimetype,
      size: req.files.file.size,
      img: Buffer.from(encImg, 'base64')
    }
    serviceCollection.insertOne({ title, price, des, image })
      .then(result => {
        if (result) {
          // console.log(result);
          res.send(result)
        }
      })
  })

  app.get('/service', (req, res) => {
    serviceCollection.find({})
      .toArray((err, documents) => {
        res.send(documents);
      })
  })


  // add service api

  app.post('/addReview', (req, res) => {
    const file = req.files.file;
    const name = req.body.name;
    const company = req.body.company;
    const dasig = req.body.dasig;
    const des = req.body.des;
    const star = req.body.star;
    // console.log(file,name,company,dasig,des,star);

    const newImg = req.files.file.data;
    const encImg = newImg.toString('base64');
    const image = {
      contentType: req.files.file.mimetype,
      size: req.files.file.size,
      img: Buffer.from(encImg, 'base64')
    }
    console.log(image);
    reviewCollection.insertOne({ name, company, dasig, des, star, image })
      .then(review => {
        res.send(review)
      })

  })

  app.get('/getReview', (req, res) => {
    reviewCollection.find({})
      .toArray((err, review) => {
        if (review) {
          res.send(review)
        }
      })
  })

  app.post('/addPayment', (req, res) => {
    const name = req.body.name;
    const email = req.body.email;
    const title = req.body.title;
    const payId = req.body.payId;
    const des = req.body.des;
    const img = req.body.image.img;
    const paymentMethod = req.body.methodMethod;
    paymentDetailsCollection.insertOne({ name, email, title, payId, paymentMethod, des, img, status: 'pending' })
      .then(document => {
        res.send(document)
      })
  })

  app.get('/getBooking', (req, res) => {
    paymentDetailsCollection.find({})
      .toArray((err, booking) => {
        if (booking) {
          res.send(booking)
        }
      })
  })

  app.post('/findBookingWithEmail', (req, res) => {
    const email = req.body.email;
    paymentDetailsCollection.find({ email: email })
      .toArray((error, documents) => {
        if (documents) {
          console.log(documents);
          // res.send(documents)
        }
      })

  })

  app.post('/checkAdmin', (req, res) => {
    const email = req.body.email;
    console.log(email);
    adminCollection.find({ email: email })
      .toArray((error, documents) => {
        res.send(documents.length > 0)
      })

  })

  app.patch('/updateStatus/:id', (req, res) => {
    const statusValue = req.body.status;
    console.log(statusValue);
    console.log(req.params.id);
    paymentDetailsCollection.updateOne(
      { _id:ObjectId(req.params.id)},
      {$set:{status:statusValue}}
    )
      .then(document => {
        // console.log(document);
        res.send(document);
      })
  })


  // api end
});


// API 


app.listen(5000)