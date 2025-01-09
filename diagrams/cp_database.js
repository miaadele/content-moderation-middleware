// Senior Design Database Schema using Mongoose Library

const mongoose = require('mongoose'); 
// mongoose.connect(...); 

// digital content data
const ContentSchema = new mongoose.Schema({
    _id: 
        { type: String, required: true }, // unique content ID (platform+key)
    hash: 
        { type: String, required: true }, // hash of content, sha-256 most widely used
    digitalSignature: 
        { type: String, required: true }, // digital signature for content
    metadata: {
        title: { type: String }, // optional to have title for content
        author: { type: String, required: true }, // username or id of creator?
        timestamp: { type: Date, required: true }, // type is BSON data; when content was created
        contentType: { type: String, required: true }, // is it an image, a video, etc?
        url: { type: String, required: true } // url of original content
    }, 
    verified: 
        { type: Boolean, default: false }, // is the content verified? 
    // need to also consider how to track and store modifications
    // unsure about
    platform: 
        { type: String, required: true }, // social media platform name
    verificationLogs: [
        {
            timestamp: { type: Date, required: true }, // time of verification
            verifiedBy: { type: String, required: true }, // id for verifier
            result: { type: String, required: true } // invalid or valid?
        }
    ] 
}); 

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

// export models
module.exports = {
    Content: mongoose.model('Content', ContentSchema), 
    Key: mongoose.model('Key', KeySchema), 
    User: mongoose.model('User', UserSchema), 
    CA: mongoose.model('CA', CASchema), 
}
