// DEPENDENCIES
var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var handlebars = require("express-handlebars");

// SCRAPING TOOLS
var axios = require("axios");
var cheerio = require("cheerio");

// ALL MODELS
var db = require("./models");

var PORT = 3000;

// INITIALIZE EXPRESS
var app = express();

// MIDDLEWARE
// MORGAN FOR LOGGING REQUESTS
app.use(logger("dev"));
// BODY-PARSER FOR HANDLING FORM SUBMISSIONS
app.use(bodyParser.urlencoded({ extended: true }));
// ACCESS TO STATIC FILES
app.use(express.static('public'));

// MONGO DB CONNECTION
// If deployed, use the deployed database. Otherwise use the local mongoHeadlines database
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/newstracker";

// Set mongoose to leverage built in JavaScript ES6 Promises
// Connect to the Mongo DB
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI);


// ROUTES
// GET ROUTE FOR SCRAPING WEBSITE
app.get("/scrape", function(req, res){
    // GRAB THE BODY OF THE HTML USING 'REQUEST'
    axios.get("https://www.reddit.com/search?q=trail+running").then(function(response){
        // LOAD IT INTO CHEERIO AND SAVE IT TO $ FOR A SHORTHAND SELECTOR
        var $ = cheerio.load(response.data);

        // NOW GRAB EVERY ARTICLE HEADLINE IN DIV TAGS WITH CLASS POST
        $("div.search-result").each(function(i, element){
            // SAVE AN EMPTY RESULT OBJECT
            var result = {};

            // ADD TEXT, HREF, AND SUMMARY OF EVERY LINK, AND SAVE THEM AS PROPERITES OF THE RESULT OBJECT
            result.title = $(this)
                .find("header")
                .children("a")
                .text();
                // .children("div#title")
                // .children("div.title-info")
                // .children("h1")
                // .children("a")
                // .text();
            result.link = $(this)
                .find("header")
                .children("a")
                .attr("href");
                // .children("div#title")
                // .children("div.title-info")
                // .children("h1")
                // .children("a")
                // .attr("href");
            result.summary = $(this)
                .find("div.search-result-body")
                .text();
            // CREATE A NEW ARTICLE USING THE 'RESULT' OBJECT BUILT FROM SCRAPING
            db.Article.create(result)
                .then(function(dbArticle){
                    // VIEW ADDED RESULT IN CONSOLE
                    console.log(dbArticle);
                })
                .catch(function(err){
                    // IF ERROR OCCURRED, SEND IT TO THE CLIENT
                    return res.json(err);
                });
        });

        // IF WE WERE ABLE TO SUCCESSFULLY SCRAPE AND SAVE AN ARTICLE, SEND A MESSAGE TO THE CLIENT
        res.send("Scrape complete");
    });
});

// ROUTE FOR GETTING ALL ARTICLES FROM THE DB
app.get("/articles", function(req, res){
    // GRAB EVERY ARTICLE IN THE ARTICLES COLLECTION
    db.Article.find({})
        .then(function(dbArticle){
            // IF WE WERE ABLE TO SUCCESSFULLY FIND ARTICLES, SEND THEM BACK TO THE CLIENT
            res.json(dbArticle);
        })
        .catch(function(err){
            // IF AN ERROR OCCURRED, SEND IT TO THE CLIENT
            res.json(err);
        });
});

// ROUTE FOR GRABBING A SPECIFIC ARTICLE BY ID, POPULATE IT WITH ITS NOTE
app.get("/articles/:id", function(req,res){
    // USING ID PASSED IN THE ID PARAMETER, PREPARE A QUERY THAT FINDS THE MATCHING ONE IN OUR DB...
    db.Article.findOne({ _id: req.params.id })
        // ...AND POPULATE ALL OF THE NOTES ASSOCIATED WITH IT
        .populate('note')
        .then(function(dbArticle){
            // IF WE WERE ABLE TO SUCCESSFULLY FIND AN ARTICLE WITH THE GIVEN ID, SEND IT BACK TO THE CLIENT
            res.json(dbArticle);
        })
        .catch(function(err){
            // IF AN ERROR OCCURRED, SEND IT TO THE CLIENT
            res.json(err);
        });
});

// ROUTE FOR SAVING/UPDATING AN ARTICLE'S ASSOCIATED NOTE
app.post("/articles/:id", function(req,res){
    db.Note.create(req.body)
        .then(function(dbNote){
            // IF A NOTE WAS CREATED SUCCESSFULLY, FIND AN ARTICLE WITH AN '_id' EQUAL TO 'req.params.id'. UPDATE THE ARTICLE TO BE ASSOCIATED WITH THE NEW NOTE
            // { new: true } TELLS THE QUERY THAT WE WANT IT TO RETURN THE UPDATE USER -- IT RETURNS THE ORIGINAL BY DEFAULT
            // SINCE OUR MONGOOSE QUERY RETURNS A PROMISE, WE CAN CHAIN ANOTHER '.then' WHICH RECEIVES THE RESULT OF THE QUERY
            return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true});
        })
        .then(function(dbArticle){
            // IF WE WERE SUCCESSFULLY ABLE TO UPDATE AN ARTICLE, SEND IT BACK TO THE CLIENT
            res.json(dbArticle);
        })
        .catch(function(err){
            // IF AN ERROR OCCURRED, SEND IT TO THE CLIENT
            res.json(err);
        });
});

// START THE SERVER
app.listen(PORT, function() {
    console.log("App running on port " + PORT + "!");
});
