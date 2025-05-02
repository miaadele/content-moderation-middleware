# to verify the signature

import hashlib
import base64
from pymongo import MongoClient
from cryptography import x509
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.asymmetric import padding
from cryptography.hazmat.primitives.serialization import load_pem_public_key
from cryptography.exceptions import InvalidSignature

import os
from dotenv import load_dotenv
import pymongo
from bson import ObjectId


def get_env_variable(var_name):
    value = os.getenv(var_name)
    if value is None:
        raise Exception(f"Missing environment variable: {var_name}")
    return value


def verify_signature(post_text: str, signature_b64: str, cert_pem_b64: str) -> bool:
    # recompute hash
    digest = hashes.Hash(hashes.SHA256())
    digest.update(post_text.encode("utf-8"))
    hashed_post = digest.finalize()

    # decode
    signature = base64.b64decode(signature_b64)
    cert_pem = base64.b64decode(cert_pem_b64)

    # load public key
    # public_key = load_pem_public_key(cert_pem)
    cert = x509.load_pem_x509_certificate(cert_pem)
    public_key = cert.public_key()

    try:
        public_key.verify(signature, hashed_post, padding.PKCS1v15(), hashes.SHA256())
        return True
    except InvalidSignature:
        return False
    except Exception as e:
        print(f"Verification failed due to error: {e}")
        return False


def main():
    # Load environment and connect to MongoDB
    dotenv_path = os.path.abspath(os.path.join(os.path.dirname(__file__), ".env"))
    load_dotenv(dotenv_path)
    mongo_uri = get_env_variable("MONGO_URI")
    client = pymongo.MongoClient(mongo_uri)
    db = client["linkedin_scraper"]
    collection = db["posts"]

    # testing by fetching latest document for now
    post = collection.find_one(sort=[("_id", -1)])

    if not post:
        print("No post found in the database.")
        return

    print("verifying post")
    print(f"post text: {post.get('post_text', '')}")
    print(f"signed at: {post.get('signed_at', '')}")

    verified = verify_signature(
        post.get("post_text", ""),
        post.get("signature", ""),
        post.get("certificate", ""),
    )

    if verified:
        print("Signature is valid and verified")
    else:
        print("Signature verification failed.")


if __name__ == "__main__":
    main()
