#test file with hardcoded URL

from dotenv import load_dotenv
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from bs4 import BeautifulSoup as bs
import json
import getpass
import re
from datetime import datetime, timezone
import pymongo
import hashlib
import base64  # to encode bytes into 64 so json doesn't scream
from bson import ObjectId  # type error fix
import sys

# import subprocess
import os
import rsa

# mongodb connect
dotenv_path = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(__file__))), ".env"
)
load_dotenv(dotenv_path)
mongo_uri = os.getenv("MONGO_URI")
print("Using MongoDB URI:", mongo_uri)
client = pymongo.MongoClient(mongo_uri)
db = client["linkedin_scraper"]
collection = db["posts"]

post_url = "https://www.linkedin.com/posts/walt-disney-imagineering_sxsw-new-groundbreaking-rides-and-experiences-activity-7304575269242036224-2n1H?utm_source=share&utm_medium=member_desktop&rcm=ACoAADzPHFIB5mj86jHpeovR1Kr1yf5F2osyntQ"

# generate rsa keys: 2048-bit
(public_key, private_key) = rsa.newkeys(2048)


def encode_base64(data):
    return base64.b64encode(data).decode("utf-8")


# function to convert mongodb objectid to string
def objectid_to_str(obj):
    if isinstance(obj, ObjectId):
        return str(obj)
    elif isinstance(obj, dict):
        return {key: objectid_to_str(value) for key, value in obj.items()}
    elif isinstance(obj, list):
        return [objectid_to_str(item) for item in obj]
    return obj

# hash posts using sha-256
def compute_sha256(text):
    # oh how i love you hashlib
    sha256_hash = hashlib.sha256()  # create
    sha256_hash.update(text.encode("utf-8"))
    return sha256_hash.hexdigest()

# function to encrypt hashed text using RSA
def rsa_encrypt(public_key, text):
    encrypted_data = rsa.encrypt(text.encode("utf-8"), public_key)
    return encrypted_data

# a 19-digit number is found in the LinkedIn URL. This is the post ID.
idRegex = re.compile(r"\d{19}")
mo = idRegex.search(post_url)
if mo:
    id = mo.group()
    print("Unique post ID: ", id)
else:
    print("No unique ID found in URL")

intid = int(id) 
timestampbin = bin = "{0:b}".format(intid) # decode id to determine the timestamp
timestamp = timestampbin[:41] # convert id into binary and extract the first 41 bits
timestamp = int(timestamp, 2) / 1000 # convert the bits back into decimal

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

metadata = {}
metadata["unique_post_id"] = id

try:
    metadata["post_text"] = soup.find(
        "div", {"class": "feed-shared-inline-show-more-text"}
    ).text.strip()
except:
    metadata["post_text"] = "Not found"

try:
    metadata["likes"] = soup.find(
        "span", {"class": "social-details-social-counts__reactions-count"}
    ).text.strip()
except:
    metadata["likes"] = "0"

try:
    metadata["post_date"] = LIpostTimestampExtractor.format_timestamp(timestamp)
except Exception as e:
    print("Timestamp formatting: ", e)
    metadata["post_date"] = "could not be calculated"

# hash the post_text
hashed_post_text = compute_sha256(metadata["post_text"])
metadata["post_text_hash"] = hashed_post_text

# encrypt hashed post using rsa
encrypted_post_text = rsa_encrypt(public_key, hashed_post_text)
encoded_encrypted_post_text = encode_base64(encrypted_post_text)
metadata["post_text_encrypted"] = encoded_encrypted_post_text

# convertion happening here
metadata = objectid_to_str(
    metadata
)  # {key: objectid_to_str(value) for key, value in metadata.items()}

# save metadata to mongodb
collection.insert_one(metadata)
print("Post metadata saved to MongoDB.")


# remove characters invalid in windows
def clean_filename(filename):
    return re.sub(r'[<>:"/\\|?*]', "_", filename)