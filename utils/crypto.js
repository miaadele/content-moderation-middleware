// crypto node.js modules to replace python 

const crypto = require('crypto'); 
const NodeRSA = require('node-rsa'); 
const base64 = require('base-64'); 
const fs = require('fs'); 
const path = require('path'); 

const keyDir = path.join(__dirname, 'keys'); 
const publicKeyPath = path.join(keyDir, 'public.pem'); 
const privateKeyPath = path.join(keyDir, 'private.pem'); 

// generate RSA key pair if not present 
function yesKeys() {
    if (!fs.existsSync(publicKeyPath) || !fs.existsSync(privateKeyPath)) {
        console.log('RSA key pair not found. Generating new keys...'); 
        if (!fs.existsSync(keyDir)) fs.mkdirSync(keyDir); 

        const key = new NodeRSA({ b: 2048 }); 
        const publicKey = key.exportKey('public'); 
        const privateKey = key.exportKey('private'); 

        fs.writeFileSync(publicKeyPath, publicKey); 
        fs.writeFileSync(privateKeyPath, privateKey); 
    }
}

yesKeys(); 

const publicKey = fs.readFileSync(publicKeyPath, 'utf8'); 
const privateKey = fs.readFileSync(privateKeyPath, 'utf8'); 

// hash using sha-256
function hashContent(content) {
    return crypto.createHash('sha256').update(content, 'utf8').digest('hex'); 
}

// encrypt using rsa 
function rsaEncrypt(text) {
    const key = new NodeRSA(); 
    key.importKey(publicKey, 'public'); 
    const encrypted = key.encrypt(text, 'buffer'); 
    return base64.encode(encrypted); 
}

// decrypt using private key
function rsaDecrypt(encryptedBase64) {
    const key = new NodeRSA(); 
    key.importKey(privateKey, 'private'); 
    const decrypted = key.decrypt(Buffer.from(base64.decode(encryptedBase64), 'binary'), 'utf-8'); 
    return decrypted; 
}

module.exports = {
    hashContent, 
    rsaEncrypt, 
    rsaDecrypt, 
    publicKey, 
    privateKey
}; 