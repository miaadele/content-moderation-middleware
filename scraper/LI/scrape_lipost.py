from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from chromedriver_autoinstaller import install
from chrome_extension_python import Extension
from bs4 import BeautifulSoup as bs
import json
import getpass
import re
from datetime import datetime, timezone

# extension path
extension_path = "arc://extensions/?id=hfkhhbiomgmepddmfgcogiljmkndeojf"
# initialize Chrome options
chrome_options = Options()
chrome_options.add_argument("--disable-gpu")
chrome_options.add_argument("--no-sandbox")
chrome_options.add_argument(Extension(extension_path).load())

# prompt user for credentials and post URL
username = input("Enter LinkedIn username: ")
password = getpass.getpass("Enter LinkedIn password: ")
post_url = input("Enter the URL of the LinkedIn post: ").strip()

# open LI page and sign in
driver_path = install()
browser = webdriver.Chrome(driver_path, options=chrome_options)
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

# Close browser
browser.quit()
