const mongoose = require('mongoose'); 
// call over to hashutils.js

// keys 
const KeySchema = new mongoose.Schema({
    _id: 
        { type: String, required: true }, // unique key ID aka hashed key
    originalKey: 
        { type: String, required: true }, // original key before hashing, can be deleted later but keeping for testing purposes
    platform: 
        { type: String, required: true }, // social media platform name
    publicKey: 
        { type: String, required: true }, // public key for verification
    created: 
        { type: Date, required: true, default: Date.now }, // key generation date
}); 

module.exports = mongoose.model('Key', KeySchema); 