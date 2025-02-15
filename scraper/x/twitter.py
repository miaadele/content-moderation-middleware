import time
import random
import requests
import snscrape.modules.twitter as snstwitter
import pandas as pd

def random_delay():
	time.sleep(random.uniform(3,10))

#defining search parameters
query = "data scraping"
min_likes = 20
language = "en"
since_year = "2025-1-01"
until_year = "2025-1-31"
xlsx_name = "tweets_jan_2025.xlsx"

tweets = [] #stores scraped tweet data

#created based on defined search params
search_query = f'{query} min_retweets:0 min_faves:{min_likes} lang:"{language}" since:{since_year} until:{until_year}'

for tweet in snstwitter.TwitterSearchScraper(search_query).get_items():
    #extract relevant info from the tweet, store in tweet_data dictionary
    tweet_data = {
        "Id": tweet.id,
        "tweet": tweet.content,
        "Date": tweet.date.strftime("%Y-%m-%d %H:%M:%S"),
        "tweet": tweet.rawContent,
        "hashtags": tweet.hashtags,
        "language": tweet.lang,
        "link": tweet.url,
        "conversation_id": tweet.conversationId,
        "yr": tweet.date.year,
        "mo": tweet.date.month,
        "Tag": tweet.date.day,
        "time": tweet.date.time().strftime("%H:%M:%S"),
        "user_id": tweet.user.id,
        "username": tweet.user.username,
    }
    random_delay()
    tweets.append(tweet_data) #append each dictionary to the tweets list

    #create pandas DataFrame and save to Excel file
    df = pd.DataFrame(tweets)
    df.to_excel(xlsx_name, index=False)
