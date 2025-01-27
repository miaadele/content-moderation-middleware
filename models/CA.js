const mongoose = require('mongoose'); 

// certification authorities
const CASchema = new mongoose.Schema({
    name: 
        { type: String, required: true, unique: true }, // name of CA, avoiding duplicates
    publicKey: 
        { type: String, required: true }, // public key of CA
    description:
        { type: String }, // description of CA, not needed but makes a user more informed
    defaultTrusted: 
        { type: Boolean, default: true }, // is the CA trusted by default? yes, yes it is
})

module.exports = mongoose.model('CA', CASchema); 