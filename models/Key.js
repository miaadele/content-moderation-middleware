const mongoose = require('mongoose'); 

// keys 
const KeySchema = new mongoose.Schema({
    _id: 
        { type: String, required: true }, // unique key ID
    platform: 
        { type: String, required: true }, // social media platform name
    publicKey: 
        { type: String, required: true }, // public key for verification
    created: 
        { type: Date, required: true, default: Date.now }, // key generation date
}); 

module.exports = mongoose.model('Key', KeySchema); 