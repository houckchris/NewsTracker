var mongoose = require("mongoose");

// SAVE A REFERENCE TO THE SCHEMA CONSTRUCTOR
var Schema = mongoose.Schema;

// USING SCHEMA CONSTRUCTOR, CREATE A NEW NOTESCHEMA SIMILAR TO A SEQUELIZE MODEL
var NoteSchema = new Schema({
    // TITLE IS A STRING TYPE
    title: String,
    // BODY IS A STRING TYPE
    body: String
});

// THIS CREATES OUR MODEL FROM THE ABOVE SCHEMA USING MONGOOSE'S MODEL METHOD
var Note = mongoose.model("Note", NoteSchema);

// EXPORT NOTE MODEL
module.exports = Note;
