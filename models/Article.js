var mongoose = require("mongoose");

// SAVE A REFERENCE TO THE SCHEMA CONSTRUCTOR
var Schema = mongoose.Schema;

// USING SCHEMA CONSTRUCTOR, CREATE A NEW USERSCHEMA, SIMILAR TO A SEQUELIZE MODEL
var ArticleSchema = new Schema({
    // TITLE IS REQUIRED AND TYPE STRING
    title: {
        type: String,
        required: true
    },
    // LINK IS REQUIRED AND A STRING
    link: {
        type: String,
        required: true
    },
    note: {
        type: Schema.Types.ObjectId,
        ref: "Note"
    }
});

// CREATE MODEL FROM ABOVE SCHEMA USING MONGOOSE MODEL METHOD
var Article = mongoose.model("Article", ArticleSchema);

// EXPORT THE ARTICLE MODEL
module.exports = Article;