const express = require('express'); 
const router = express.Router(); 
const { hashContent, rsaEncrypt } = require('../utils/crypto'); 
const { MongoClient } = require('mongodb'); 
const { post } = require('jquery');

const mongoUri = process.env.MONGO_URI; 
const client = new MongoClient(mongoUri); 
const dbName = 'linkedin_scrape'; 
const collectionName = 'posts'; 

router.post('/', async (req, res) => {
    const { postText, postUrl, likes, postDate, uniquePostId } = req.body; 

    try {
        await client.connect(); 
        const db = client.db(dbName); 
        const collection = db.collection(collectionName); 

        const hash = hashContent(postText); 
        const encrypted = rsaEncrypt(hash); 

        const metadata = {
            unique_post_id: uniquePostId, 
            post_test: postText, 
            post_test_hash: hash, 
            post_text_encrypted: encrypted, 
            likes, 
            post_date: postDate, 
            post_url: postUrl
        }; 

        await collection.insertOne(metadata); 

        res.status(200).json({ message: 'Post verified and saved.', metadata }) // please work
    } catch (err) {
        console.error(err); 
        res.status(500).json({ error: 'failed to verify post.' }); // sigh
    } finally {
        await client.close(); 
    }
}); 

module.exports = router; 