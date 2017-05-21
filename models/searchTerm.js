const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Model
const searchTermSchema = new Schema({
    searchVal : String,
    searchDate : Date
},{timestamps: true});

// Connects model and collection
const ModelClass = mongoose.model('searchTerm',searchTermSchema);

module.exports = ModelClass;