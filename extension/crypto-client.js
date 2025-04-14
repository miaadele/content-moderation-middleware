// browser version using Forge
let PUBLIC_KEY_PEM = "";

async function loadPublicKey() {
    const res = await fetch("http://localhost:8080/keys/public-key");
    PUBLIC_KEY_PEM = await res.text();
}

// SHA-256 hash using Web Crypto API
async function hashContent(content) {
    const encoder = new TextEncoder();
    const data = encoder.encode(content);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer))
                .map(b => b.toString(16).padStart(2, '0'))
                .join('');
}

// RSA encryption using forge
function rsaEncrypt(text) {
    const publicKey = forge.pki.publicKeyFromPem(PUBLIC_KEY_PEM);
    const encrypted = publicKey.encrypt(text, 'RSA-OAEP', {
        md: forge.md.sha256.create(),
        mgf1: forge.mgf.mgf1.create(forge.md.sha1.create())
    });
    return forge.util.encode64(encrypted);
}
