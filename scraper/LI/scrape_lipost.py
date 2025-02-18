from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from bs4 import BeautifulSoup as bs
import json
import time
import getpass
import re
import urllib.parse
from datetime import datetime, timezone
import sys

# initialize Chrome options
chrome_options = Options()
# chrome_options.add_argument("--headless")
chrome_options.add_argument("--disable-gpu")
chrome_options.add_argument("--no-sandbox")

# prompt user for credentials and post URL
username = input("Enter LinkedIn username: ")
password = getpass.getpass("Enter LinkedIn password: ")
post_url = input("Enter the URL of the LinkedIn post: ").strip()

# open LI page and sign in
browser = webdriver.Chrome(options=chrome_options)
browser.get("https://www.linkedin.com/login")

# login and navigate to specific post
browser.find_element(By.ID, "username").send_keys(username)
browser.find_element(By.ID, "password").send_keys(password)
browser.find_element(By.ID, "password").submit()
time.sleep(2)
browser.get(post_url)
time.sleep(2)

post_page = browser.page_source
soup = bs(post_page, "html.parser")

#a 19-digit number is found in the LinkedIn URL. This is the post ID.
timestampRegex = re.compile(r'\d{19}')
mo = timestampRegex.search(post_url)
if mo:
    timestamp = mo.group()
    print("Unique post ID: ", timestamp)
else:
    print("No unique ID found in URL")

# post timestamp extraction code is from Ollie-Boyd's github
class LIpostTimestampExtractor:
    @staticmethod
    def format_timestamp(
        timestamp_s, get_local: bool = False, return_datetime: bool = False
    ):
        # format timestamp to UTC
        if get_local:
            date = datetime.fromtimestamp(timestamp_s)
            # return date.strftime('%a, %d %b %Y %H:%M:%S GMT')
        else:
            date = datetime.fromtimestamp(timestamp_s, tz=timezone.utc)
            # return date.strftime('%a, %d %b %Y %H:%M:%S GMT (UTC)')

        if return_datetime:
            return date

        return date.strftime(
            "%a, %d %b %Y %H:%M:%S GMT" + (" (UTC)" if not get_local else "")
        )


metadata = {}
metadata["unique_post_id"] = timestamp

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
except:
    metadata["post_date"] = "could not be calculated"


# Save metadata to JSON file
post_id = post_url.split("/")[-1]  # Extract unique post ID from URL
json_filename = f"linkedin_post_{post_id}.json"


# remove characters invalid in windows
def clean_filename(filename):
    return re.sub(r'[<>:"/\\|?*]', "_", filename)


json_filename = clean_filename(json_filename)

with open(json_filename, "w", encoding="utf-8") as json_file:
    json.dump(metadata, json_file, indent=4, ensure_ascii=False)

print(f"Post metadata saved to {json_filename}")

# Close the browser
browser.quit()
