var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var ArticleSchema = new Schema ({
    title: {
        type: String,
        unique: true
    },
    summary: String,
    link: String,
    comment: [{
        type: Schema.Types.ObjectId,
        ref: "Comment"
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

var Article = mongoose.model("Article", ArticleSchema);

module.exports = Article;