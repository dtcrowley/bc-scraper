var express = require("express");
var path = require("path");
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
var exphbs = require("express-handlebars");
var cheerio = require("cheerio");
var request = require("request");

var db = require("../models");

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/bc-nyt-scraper";

mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI);

var router = express.Router();

router.get("/", function(req, res){
    db.Article.find({})
    .then(function(data){
        console.log(data)
        var object = {articles:data}
        res.render("index", object)
    })
})

router.get("/comment/:id", function(req, res){
    db.Article.findById(req.params.id)
    .populate("comment")
    .then(function(data){
        res.json(data)
    })
    .catch(function(err){
        res.json(err);
    });
})

router.post("/comment:id", function(req, res){
    db.Comment.create(req.body)
    .then(function(data){
        return db.Article.findByIdAndUpdate(req.params.id, { $push: { comment: data._id } }, { new: true });
    })
    .then(function(commentAdded) {
        console.log("Comment added: " + commentAdded)
        res.json(commentAdded);
    })
    .catch(function(err){
        console.log(err);
    });
})

router.get("/scrape", function (req, res){
    request("https://www.nytimes.com", function(error, response, html){
        
    var $ = cheerio.load(html);
     
    $("article").each(function(i, element){
        
        var title = $(element).find(".storyheading").children().text().trim();
        var summary = $(element).find(".summary").children().text().trim();
        var link = $(element).find(".storyheading").children("a").attr("href");

        var newArticle = {
            title: title,
            summary: summary,
            link: link
        }

        console.log(newArticle);

        if (title && summary && link) {
            db.Article.create(newArticle)
            .catch(function(err){
                console.log(err)
            })
        }
    
    })

    })
    .then(function(){
        res.redirect("/");
    })
    .catch(function(err) {
        console.log(err);
    })
})

module.exports = router;