const bodyParser = require('body-parser');
const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const app = express();

/**
 we have to tell the express server to make the files inside public directory public using
 express's built in express.static middleware.
 */
 app.use(express.static('public'));

/**
 The urlencoded method tells body parser to extract data from the form elements and 
 place it within the body property of request object.
 */
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');
const connect_string = 'mongodb+srv://XXXX:XXXXX@cluster0.a0zpu.mongodb.net/myFirstDatabase?retryWrites=true&w=majority'


app.use(bodyParser.json()) // we teach the server to accept JSON

MongoClient.connect(connect_string, {
    useUnifiedTopology: true
  }).then((client) => {
    console.log("database connected");

    //create new db name (if the name of database is not provided below, it will use one from connection string)
    const db = client.db('Star-wars-quotes');

    //rest dbase code follows here:-

    //1. Create a quote collection
    const quotesCollection = db.collection("quotes"); //return a reference to mongodb collection
    app.post('/quote', (req, res) => {
        //add items to mongodb collection
        quotesCollection.insertOne(req.body)
        .then((result) => {
            console.log(result);
            res.redirect('/');
        })
        .catch((err) => {
            console.log(err);
        })
    })

    /**
        Like POST, we have PUT which can also be triggered based on <form> element or JavaScript.
        We saw POST with form, let's use PUT with JavaScript
    */

    app.put('/quotes', (req, res) => {
        //it gets req.body from main.js
        //console.log(req.body);
        // first parameter is query based on which it filters. second is the things needed to be updated
        // $set sets the value of a field in the document. 
        //third param is optional. upsert: true implies insert a document if no doc is present to get updated.
        quotesCollection.findOneAndUpdate({name: 'Jayashree Panda'}, 
        { $set: 
            {name: req.body.name,
            query: req.body.query}
        },
        {
            upsert: true
        }) 
        .then((result) => {
            res.json('success')
            console.log(result);
        })   
        .catch((err) => {
            console.log(err);
        })    
    })

    app.delete('/quotes', (req, res) =>{
        quotesCollection.deleteOne({name : req.body.name})
        .then((result) =>{
            if (result.deletedCount === 0) {
                return res.json('No quote to delete')
            }
            res.json('Jayashree Pa quote is deleted');
        })
        .catch((err) => {
            console.log(err);
        })
    })
    
    app.get('/', (req, res) => {
        //dirname is the curren directory you are in
    
        //find method returns a curser and using toArry we get each quote.
        db.collection("quotes").find().toArray()
        .then((result) => {
            //console.log(result);
            res.render('index.ejs', {quotes: result});
        })
        .catch((err) => {
            console.log(err);
        })
        
    })
  }).catch((err) => {
      console.log(err);
  })



app.listen(4000, () => {
    console.log("App listening at port 4000");
})