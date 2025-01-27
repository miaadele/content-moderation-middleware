const mongoose = require('mongoose'); 

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

module.exports = mongoose.model('Content', ContentSchema);