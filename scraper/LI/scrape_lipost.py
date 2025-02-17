from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from bs4 import BeautifulSoup as bs
import json
import time
import getpass

#initialize Chrome options
chrome_options = Options()
#chrome_options.add_argument("--headless")
chrome_options.add_argument("--disable-gpu")
chrome_options.add_argument("--no-sandbox")

#prompt user for credentials and post URL
username = input("Enter LinkedIn username: ")
password = getpass.getpass("Enter LinkedIn password: ")
post_url = input("Enter the URL of the LinkedIn post: ").strip()

#open LI page and sign in 
browser = webdriver.Chrome(options = chrome_options)
browser.get("https://www.linkedin.com/login")

#login and navigate to specific post
browser.find_element(By.ID, "username").send_keys(username)
browser.find_element(By.ID, "password").send_keys(password)
browser.find_element(By.ID, "password").submit()
time.sleep(3)
browser.get(post_url)
time.sleep(3)

post_page = browser.page_source
soup = bs(post_page, "html.parser")

metadata = {}

try:
     metadata["post_text"] = soup.find("div", {"class": "feed-shared-inline-show-more-text"}).text.strip()
except:
    metadata["post_text"] = "Not found"

try:
    metadata["likes"] = soup.find("span", {"class": "social-details-social-counts__reactions-count"}).text.strip()
except:
    metadata["likes"] = "0"

try:
    metadata["comments"] = soup.find("span", {"class": "social-details-social-counts__comments"}).text.strip()
except:
    metadata["comments"] = "0"

try:
    metadata["shares"] = soup.find("span", {"class": "social-details-social-counts__shares"}).text.strip()
except:
    metadata["shares"] = "0"

# Save metadata to JSON file
post_id = post_url.split("/")[-1]  # Extract unique post ID from URL
json_filename = f"linkedin_post_{post_id}.json"

with open(json_filename, "w", encoding="utf-8") as json_file:
    json.dump(metadata, json_file, indent=4, ensure_ascii=False)

print(f"Post metadata saved to {json_filename}")

# Close the browser
browser.quit()