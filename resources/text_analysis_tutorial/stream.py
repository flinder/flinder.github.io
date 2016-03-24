#Import the necessary methods from tweepy library
from __future__ import unicode_literals
from tweepy.streaming import StreamListener
from tweepy import OAuthHandler
from tweepy import Stream
import re

#Variables that contains the user credentials to access Twitter API 
access_token = "2188480484-8Ea4NAWug0tNdTBcoIrQYvdXyWaVlzKASaFci3U"
access_token_secret = "JoU9h00CJP6gCLqWInAwzZwNdR1kwwWE6VbAYVGT9jO6j"
consumer_key = "uc2lcuYdUf6G6mmdqUSE2VM4k"
consumer_secret = "HBFlpx8sBP9ASA8e5AqARDA21Vn3edDSNn8aYq1fl90BK8fx8u"
newline = re.compile(r'\n^')

#This is a basic listener that just prints received tweets to stdout.
class StdOutListener(StreamListener):

    def on_data(self, data):
        print(data)
        return True

    def on_error(self, status):
        print status

if __name__ == '__main__':

    #This handles Twitter authetification and the connection to Twitter Streaming API
    l = StdOutListener()
    auth = OAuthHandler(consumer_key, consumer_secret)
    auth.set_access_token(access_token, access_token_secret)
    stream = Stream(auth, l)

    #This line filter Twitter Streams to capture data by the keywords
    stream.filter(track=['Trump'])
