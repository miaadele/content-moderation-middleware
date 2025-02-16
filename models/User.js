const mongoose = require('mongoose'); 

// user
const UserSchema = new mongoose.Schema({
    _id: 
        { type: String, required: true }, // unique user id
    username: 
        { type: String, required: true }, // user's "name"
    email: 
        { type: String, required: true }, // user's email
    registeredAt: 
        { type: Date, required: true, default: Date.now }, // when they created an account
    content: {
        type: Map, 
        of: new mongoose.Schema({
            contentId: { type: String, ref: 'Content', required: true }, // reference to content document
            postedAt: { type: Date, required: true, default: Date.now }, // timestamp of when content published
            status: { type: String, default: 'active' }, // is the content published or deleted? might not be necessary
        }), 
    }, 
    trustedAuthorities: {
        type: Map, 
        of: Boolean, // true for trusted, false for untrusted
        default: async () => {
            const allCAs = await CA.find({}); 
            const defaultMap = {}; 
            allCAs.forEach((ca) => {
                defaultMap[ca._id] = ca.defaultTrusted; 
            }); 
            return defaultMap; 
        }, 
    }, 
}); 

module.exports = mongoose.model('User', UserSchema); 