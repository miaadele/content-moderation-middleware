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
import json
import sys


# function for env
def get_env_variable(var_name):
    value = os.getenv(var_name)
    if value is None:
        raise Exception(f"Missing environment variable: {var_name}")
    return value


def verify_signature(post_text: str, signature_b64: str, cert_b64: str) -> bool:
    # decode signature and certificate
    signature = base64.b64decode(signature_b64)
    cert_bytes = base64.b64decode(cert_b64)
    cert = x509.load_pem_x509_certificate(cert_bytes)
    public_key = cert.public_key()

    # verify against
    public_key.verify(
        signature, post_text.encode("utf-8"), padding.PKCS1v15(), hashes.SHA256()
    )
    return True


def main():
    if len(sys.argv) != 2:
        print(json.dumps({"verified": False, "error": "usage"}))
        sys.exit(1)

    unique_id = sys.argv[1]

    # load .env and connect
    load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))
    mongo_uri = get_env_variable("MONGO_URI")
    client = MongoClient(mongo_uri)
    db = client["linkedin_scraper"]
    collection = db["posts"]

    # fetch document
    doc = collection.find_one({"unique_post_id": unique_id})
    if not doc:
        print(json.dumps({"verified": False, "error": "post not found"}))
        sys.exit(1)

    # put into variables so it's easy to change
    post_text = doc.get("post_text", "")
    signature_b64 = doc.get("signature", "")
    cert_b64 = doc.get("certificate", "")

    try:
        verify_signature(post_text, signature_b64, cert_b64)
        print(json.dumps({"verified": True}))
        sys.exit(0)
    except InvalidSignature:
        print(json.dumps({"verified": False, "error": "invalid signature"}))
        sys.exit(0)
    except Exception as e:
        print(json.dumps({"verified": False, "error": str(e)}))
        sys.exit(1)


if __name__ == "__main__":
    main()
