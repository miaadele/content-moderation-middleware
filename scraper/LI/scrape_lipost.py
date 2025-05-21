# LinkedIn Metadata Scraper
# Created by Vani Aggarwal and Mia Lassiter
# April 2025

from dotenv import load_dotenv
import json
import re
from datetime import datetime, timezone
import pymongo
import json
import hashlib
import base64  # to encode bytes into 64 so json doesn't scream
from bson import ObjectId  # type error fix
import sys

# import subprocess
import os

# crypto libraries
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import padding
from cryptography.hazmat.primitives.serialization import (
    load_pem_private_key,
    load_pem_public_key,
)
from cryptography import x509
from cryptography.hazmat.backends import default_backend


sys.stdout.reconfigure(
    encoding="utf-8"
)  # to account for emojis and special characters

input_data = json.load(sys.stdin) # read from stdin / POST body

post_url = input_data.get("postUrl", "")
postText = input_data.get("postText", "")
likes = input_data.get("likesCount", "")

# mongodb connect
dotenv_path = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(__file__))), ".env"
)
load_dotenv(dotenv_path)
mongo_uri = os.getenv("MONGO_URI")
client = pymongo.MongoClient(mongo_uri)
db = client["linkedin_scraper"]
collection = db["posts"]

BASE_DIR = os.path.dirname(os.path.abspath(__file__))  # Get script directory

def encode_base64(data):
    return base64.b64encode(data).decode("utf-8")

# load signing key (the leaf private key)
KEYS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "keys"))
CERTS_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..", "certs")
)

key_path = os.path.join(KEYS_DIR, "mycodesign.key")
cert_path = os.path.join(CERTS_DIR, "mycodesign.crt")

with open(key_path, "rb") as key_file:
    private_key = load_pem_private_key(key_file.read(), password=None)

with open(cert_path, "rb") as cert_file:
    cert_data = cert_file.read()
    cert = x509.load_pem_x509_certificate(cert_data, default_backend())
    public_key = cert.public_key()

# function to convert mongodb objectid to string
def objectid_to_str(obj):
    if isinstance(obj, ObjectId):
        return str(obj)
    elif isinstance(obj, dict):
        return {key: objectid_to_str(value) for key, value in obj.items()}
    elif isinstance(obj, list):
        return [objectid_to_str(item) for item in obj]
    return obj

# function to make text pretty
def clean_text(text): 
    try:
        # Try encoding to UTF-8 and decoding to handle surrogate pairs
        return text.encode("utf-8", "ignore").decode("utf-8", "ignore")
    except UnicodeEncodeError as e:
        print(f"Error cleaning text: {e}")
        return text  # Return original text in case of an encoding issue

postText = clean_text(postText)  # utf encoding error

# hash posts using sha-256
def compute_sha256(text):
    sha256_hash = hashlib.sha256()
    sha256_hash.update(text.encode("utf-8"))
    return sha256_hash.hexdigest()

# function to encrypt hashed text using RSA
def rsa_encrypt(public_key, text):
    encrypted = public_key.encrypt(text.encode("utf-8"), padding.PKCS1v15())
    return encrypted

# a 19-digit number is found in the LinkedIn URL. This is the post ID.
idRegex = re.compile(r"\d{19}") 
mo = idRegex.search(post_url)
if mo:
    id = mo.group()
    print("Unique post ID: ", id)
else:
    print("No unique ID found in URL")

intid = int(id)
timestampbin = bin = format(intid, "b")
timestamp = timestampbin[:41]
timestamp = int(timestamp, 2) / 1000


# post timestamp conversion code is from Ollie-Boyd's github
class LIpostTimestampExtractor:
    @staticmethod
    def format_timestamp(
        timestamp_s, get_local: bool = False, return_datetime: bool = False
    ):
        # format timestamp to UTC
        if get_local:
            date = datetime.fromtimestamp(timestamp_s)
        else:
            date = datetime.fromtimestamp(timestamp_s, tz=timezone.utc)

        if return_datetime:
            return date

        return date.strftime(
            "%a, %d %b %Y %H:%M:%S GMT" + (" (UTC)" if not get_local else "")
        )

# saving metadata to database
metadata = {}
metadata["unique_post_id"] = id

try:
    metadata["post_text"] = postText
except:
    metadata["post_text"] = "Not found"

try:
    metadata["likes"] = likes

except:
    metadata["likes"] = "0"

try:
    metadata["post_date"] = LIpostTimestampExtractor.format_timestamp(timestamp)
except Exception as e:
    print("Timestamp formatting: ", e)
    metadata["post_date"] = "could not be calculated"

# hash the post_text
hashed_post_text = compute_sha256(clean_text(postText))
metadata["post_text_hash"] = hashed_post_text

# sign the raw post text directly (best practice)
signature = private_key.sign(
    postText.encode("utf-8"), padding.PKCS1v15(), hashes.SHA256()
)
metadata["signature"] = base64.b64encode(signature).decode("utf-8")

# include certificate in base64
metadata["certificate"] = base64.b64encode(cert_data).decode("utf-8")
metadata["signed_at"] = datetime.now(timezone.utc)

# optional: encrypt the hash for confidentiality
encrypted = public_key.encrypt(
    metadata["post_text_hash"].encode("utf-8"), padding.PKCS1v15()
)
metadata["post_text_encrypted"] = base64.b64encode(encrypted).decode("utf-8")

# conversion from object id to string
metadata = objectid_to_str(
    metadata
)

metadata["signed_at"] = datetime.now(timezone.utc)
metadata["certificate"] = base64.b64encode(cert_data).decode("utf-8")  # cert_pem
metadata["signature"] = base64.b64encode(signature).decode("utf-8")

# save metadata to mongodb
collection.insert_one(metadata)
print(json.dumps({"success": True, "message": "Post metadata saved to MongoDB."}))
