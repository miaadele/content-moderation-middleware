from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from dotenv import load_dotenv

# from chromedriver_autoinstaller import install
# from chrome_extension_python import Extension
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

# arguments from node
if len(sys.argv) != 4:  # first one is process
    print("usage wrong")
    sys.exit(1)

username = sys.argv[1]
password = sys.argv[2]
post_url = sys.argv[3]

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

# BASE_DIR = os.path.dirname(os.path.abspath(__file__))  # Get script directory

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


# hashing_path = os.path.join(BASE_DIR, "rsa\hashing.exe")
# result = subprocess.run(
#     [hashing_path], input=text.encode(), capture_output=True, text=True
# )
# return result.stdout.strip()


# Function to encrypt the hashed text using RSA
# def rsa_encrypt(text):
#   rsa_path = os.path.join(BASE_DIR, "..\rsa\rsa.exe")
#   result = subprocess.run(
#       [rsa_path, "encrypt"], input=text.encode(), capture_output=True, text=True
#    )
#   return result.stdout.strip()


# function to encrypt hashed text using RSA, please work
def rsa_encrypt(public_key, text):
    encrypted_data = rsa.encrypt(text.encode("utf-8"), public_key)
    return encrypted_data


# extension path
# extension_path = "chrome://extensions/?id=hfkhhbiomgmepddmfgcogiljmkndeojf"
# initialize Chrome options
chrome_options = Options()
chrome_options.add_argument("--disable-gpu")
chrome_options.add_argument("--no-sandbox")
# chrome_options.add_argument(Extension(extension_path).load())

# prompt user for credentials and post URL
# username = input("Enter LinkedIn username: ")
# password = getpass.getpass("Enter LinkedIn password: ")
# post_url = input("Enter the URL of the LinkedIn post: ").strip()

# open LI page and sign in
# driver_path = install()
browser = webdriver.Chrome(options=chrome_options)
browser.get("https://www.linkedin.com/login")

# login and navigate to specific post
browser.find_element(By.ID, "username").send_keys(username)
browser.find_element(By.ID, "password").send_keys(password)
browser.find_element(By.ID, "password").submit()
browser.get(post_url)
post_page = browser.page_source
soup = bs(post_page, "html.parser")

# a 19-digit number is found in the LinkedIn URL. This is the post ID.
idRegex = re.compile(r"\d{19}")
mo = idRegex.search(post_url)
if mo:
    id = mo.group()
    print("Unique post ID: ", id)
else:
    print("No unique ID found in URL")

# decode id to determine the timestamp
# convert id into binary and extract the first 41 bits
# convert the bits back into decimal
intid = int(id)
timestampbin = bin = "{0:b}".format(intid)
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

# Save metadata to JSON file
# post_id = post_url.split("/")[-1]  # Extract unique post ID from URL
# json_filename = f"linkedin_post_{post_id}.json"


# remove characters invalid in windows
def clean_filename(filename):
    return re.sub(r'[<>:"/\\|?*]', "_", filename)


# json_filename = clean_filename(json_filename)

# with open(json_filename, "w", encoding="utf-8") as json_file:
#    json.dump(metadata, json_file, indent=4, ensure_ascii=False)

# print(f"Post metadata saved to {json_filename}")

# Close browser
browser.quit()
