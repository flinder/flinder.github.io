---
layout: post
title: "Blog"
post_title: "Basics of Computational Text Analysis - The Boring Part"
date: 2016-03-24
image_source: /images/text_intro_logo.png
excerpt: "A tutorial for the basics of computational text analysis. For absolute beginners: how do I get from natural language to a term document matrix?"
comments: "true"
---

#### What, Why, for Who?
<hr/>
This is a little tutorial I gave for my visualization class in the Geography Department at Penn State. I introduce the very basic steps that are necessary to get messy text collected online or in other places into a form to be usable for more sophisticated text analysis tools. There are a lot of great resources out there that explain all kinds of cool things that you can do with text, but there are a lot of nitty gritty details to consider before you can get started. As an example I use some twitter data I collected with the search term `Trump`.  

There are a few tutorials for the basics of text analysis, but they mostly are focused on R and use packages or modules that obscure what actually is happening under the hood. I prefer to demonstrate with basic (slow and not optimized) code what is happening; most of the steps are not very compicated anyway. 

This tutorial is aimed at beginners in text analysis with little experience with computational tools. I provide actual example code that demonstrates how every idea would be realized. Everything is written in basic python. For those who are not familiar with programming I try to explain every step so you don't have to know python in order to follow. 

You can find the whole tutorial as an ipython notebook and all the materials on my [github](https://github.com/flinder/flinder.github.io/tree/master/text_analysis_tutorial).

#### Roadmap
<hr/>
To get from text that you find in the real world, to something you can work with requires many steps. Which ones you take will also depend heavily on the task you want to acomplish in the end. It is therefore hard to give a general tutorial that will work in every scenario. But many steps are required in every application so I will discuss the most important ones.

In this tutorial I explain how to get from a text corpus (collection of documents) to a (usable) document term matrix (DTM). A lot (but not all) statistical analyses of text are based on DTMs. The core idea is to assume that all the information in a document is contained in the frequency of each word. Then each document is represented as a vector of length `v`, where `v` is the number of unique words in the whole corpus. Each element of the vector gives a count (or other measure) of how often the word appears in the document. The DTM is then a matrix where each row is a document vector. 

Here's an example. Let's look three documents:

1. my dog likes my porcupine
2. my porcupine doesn't like my dog
3. my dog eats my porcupine

The vocabulary is `V = ["my", "dog", "likes", "porcupine", "doesn't", "like", "eats"]`. So the DTM is:

<pre><code class="javascript">    My dog likes porcupine doesn't like eats
1.  2  1   1     1         0       0    0
2.  2  1   0     1         1       1    0
3.  2  1   0     1         0       0    1
</code></pre>

Note that this matrix can also be interpreted geoetrically, where each row-vector describes the location of its corresponding document in a space with `v` dimensions. This fact is very important for more sophisticated text analysis techniques. For example, similarity of documents is often measured as the cosine of the angle between two document vectors. 

In order to get to this matrix and especially to get to a usable matrix that is of manageable size, there are several steps to take. I will demonstrate the following things:

- Loading Text, Encodings, Memory
- Manipulating Text: Regular Expressions
- Tokenization
- Generating the DTM
- The Sparsity Problem
- Text Preprocessing
- Stemming and Lemmatization

#### Loading Text, Memory
<hr/>

For the rest of the tutorial we will be working with twitter data. I collected about 2000 tweets from the [Twitter Streaming API](https://dev.twitter.com/streaming/overview) ([This](http://adilmoujahid.com/posts/2014/07/twitter-analytics/) is a good tutorial on how to collect Twitter data with Python) using the search term `Trump`.

This dataset is very small an it is normally not a problem to just load it into memory. However, especially when working with social media data, size can quickly be a problem. Since this is a basic intro I will not go into detail, but I will show the difference between loading all your data into memory and then working on it and processing only small portions of data at a time (streaming the data). I think it is good practice to do this whenever possible.

Since we will be working with twitter data for the class project, I will make a little detour and show how to load one tweet at a time from disk, extract the text of the tweet and discard all other information. This way we can process large quantities of data with less memory.

Let's take a look at the data first to make this clearer. The first tweet we collected looks like this:

<pre><code class="javascript">{"created_at":"Tue Mar 15 18:54:26 +0000 2016","id":709815032113184768,
 "id_str":"709815032113184768",
 "text":"Ben Carson Reveals the Real Reasons He Endorsed Donald Trump. #WhatWouldYouDoForAKlondikeBar?",
 "source":"\u003ca href=\"http:\/\/twitter.com\" rel=\"nofollow\"\u003eTwitter Web Client\u003c\/a\u003e",
 "truncated":false,
 "in_reply_to_status_id":null,
 "in_reply_to_screen_name":null,
 "user":{"id":2937476451,
 "id_str":"2937476451",
 "name":"Nate Madden",
 "screen_name":"NateMadden_IV",
 "location":"Washington, DC",
  ...
  }
</code></pre>

The data is in json format. Each json document is surrounded by `{}` and has keys (`"created_at", "id_str", "text",...`) and values (`"Tue Mar 15...", "7098...", "Ben Carson Reveals..."`). I don't display all the information here, but each tweet has at about 100 such key - value pairs. 

For this tutorial we only need the value of the `"text"` key, which contains the text the user wrote in her tweet. We will therefore load only one tweet at a time, extract the text and discard all the other information.

#### Retrieving information from tweets 
<hr/>


<pre><code class="python">import io 

tweet_file_connection = io.open('data.json', mode='r', encoding='utf-8')
</code></pre>


This line opens a connection to the file on disk the file contains one tweet per line.  Note that this is just a pipe to the data in the file, the object 'tweet_file_connection' does not contain any tweets yet. In order to get at the tweets, we can *iterate* over the lines of the file. Let's extract the text of the tweet and store it in memory:


<pre><code class="python">import json # Module to make python understand the json data structure

# Empty list to strore the tweets
tweets = []

# Loop through the file, one line at a time
for line in tweet_file_connection:

    # Parse the data structure, so we can access the keys directly
    tweet = json.loads(line)
    
    # Retrieve the text and author id
    text = tweet['text']
        
    # Store it in the list
    tweets.append(text)
</code></pre>

Let's check if it worked

<pre><code class="python">print len(tweets)
print tweets[:2]
</code></pre>

Output:
<pre><code class="python">1521
[u'RT @donnabrazile: Amazing. https://t.co/SfxHD92gCJ', u'@Miami4Trump @RogerJStoneJr @jwlancasterjr @CLewandowski_ The ploy is to leave off Trump name &amp; tell people to vote Wed w/corrected ballots']
</code></pre>

It did we collected 1521 tweets and below we can see the text of the first two.

#### Manipulating Text: Regular Expressions
<hr/>

Regular expressions are basically templates that can be used to match character sequences. You have probably used them. For example when you type a search into a search engine you can use the `*` to match several terms with one query. For example `read*` would match `reading`, `reader`, `readings`, `reads`, etc. In this case `*` is a regular expression that says 'match every character except a space'. 

Regular expressions differ slightly between programming languages. This [regex tester](https://regex101.com/#python) is a really cool ressource to test your regular expressions. 

In python regular expressions are contained in the `re` module. We will first write some regular expressions to do some simple things and then do something slightly more complex. 

Let's start simple. Consider the following sentence:

```
"It's just a movie Donald"
```

We will first write a regular expression that replaces all vowels with `_`.


<pre><code class="python"># Load the re module
import re

s = "It's just a movie Donald"

# This is the regular expression. The brakets are a special character that says 
# "match each character in this set of characters"
vowels = '[aeiou]'

# The sub() function in the re module allows us to substitute stuff for the 
# regular expression
re.sub(pattern=vowels, repl="_", string=s)
</code></pre>

Output:
<pre><code class="python">"It's j_st _ m_v__ D_n_ld"
</code></pre>


This worked well. We saw that the `[` `]` where key to do this. There are a lot of these special characters, which you just have to look up. Here are some of the most important basics:

#### Some basic expressions
<hr/>

- `[]`: A set of characters/expressions. E.g. `[A-Z]` matches all upper case letters
- `.`: Matches everything
- `+`: Matches one or more of the preceding character
- `?`: Matches 0 or one repetitions of the preceding character
- `\n`: Newline
- `\t`: Tab
- `\s`: Every space character, e.g. `\n`, `\t`, `\r`
- `^`: Beginning of string
- `$`: End of string
- `[^]`: Negation of a set, e.g. `[^A-Z]` matches everything that's not an uppercase letter

Just some examples. See the [documentation]() for an exhaustive list and use Google and [regex tester](https://regex101.com/#python) extensively. 

One more simple example. Let's find all the upper case words in the example sentence and replace them with `MATCH`.


<pre><code class="python">
# The regular expression. Again the brackets for a group. [A-Z] matches all uppercase letters from A-Z. \S matches
# everything BUT space characters and + means repeat the previous character until you encounter one that doesn't fit.
# So in words: "Match everything that starts with an upper case letter, followed by arbitrarily many other characters
# until you hit a space
upper_case_word = "[A-Z]\S+"
re.sub(pattern=upper_case_word, repl='MATCH', string=s)
</code></pre>


Output:
<pre><code class="python">'MATCH just a movie MATCH'
</code></pre>



I guess you can see that regular expressions can be very helpful in many different situations. Let's use it with our example. Maybe we want to find all hashtags (`#textAnalysis`) and twitter handles (`@frido`), count the and find the most common ones.


<pre><code class="python"># Our regular expressions:

# Everything that starts with `#` followd by arbitrarily many repetitions of everything but (^ is the negation of the 
# gorup in the brackets) `space`, `end of string`, `newline`. And the same thing for handles with @.
# We can compile the regular expression, because we use 
re_hash = '#[^\s$\n]+'
re_hand = '@[^\s$\n]+'

# Loop throuh all the tweets and find all matches with the findall() method. Findall returns a list 
# of all matches

# Empty dictionaries to store each handle/hastag and a count of how often it appears
handles = {}
hashtags = {}

for tweet in tweets:
    hand = re.findall(pattern=re_hash, string=tweet)
    hasht = re.findall(pattern=re_hand, string=tweet)
    
    # For each handle we found, check if we saw it already
    # (if it's in our dictionary), if so increment the count
    # by one, if not make a new entry and set the count to 1
    
    for handle in hand:
        if handle in handles:
            handles[handle] += 1
        else:
            handles[handle] = 1
            
    # Same thing for the hashtags        
    for hashtag in hasht:
        if hashtag in hashtags:
            hashtags[hashtag] += 1
        else:
            hashtags[hashtag] = 1
</code></pre>

Let's check if it worked:

<pre><code class="python"># Print the first 5 entries of handles:
for index, handle in enumerate(handles):
    print handle + ": " + str(handles[handle])
    if index == 5:
        break
</code></pre>

Output:
<pre><code class="python">#GOPConvention: 1
#Kasich4Us: 1
#VR's: 1
#unitewithcruz: 1
#BenCarson:: 1
#Endorse: 1
</code></pre>

Looks good. Most hashtags seem to appear only once in this small collection of tweets. Let's see what the most common hashtags and handles are:


<pre><code class="python">max_hand = max(handles, key=handles.get)
max_hash = max(hashtags, key=hashtags.get)

print max_hand + ": " + str(handles[max_hand])
print max_hash + ": " + str(hashtags[max_hash])
</code></pre>

<pre><code class="python">#Trump: 64
@realDonaldTrump: 75
</code></pre>


#### Tokenization
<hr/>

Most statistical text analysis is based on the 'bag-of-words' approach: It is assumed information in documents is purely contained in the word counts of a document. Grammatical and syntactical structure is ignored. Through this assumption we clearly lose a lot of information. But it makes analysis of text tremendously easier and is sufficient in many situations. Let's first count all words in each document.

To do this we have to split the document into discrete words, they are also called 'tokens' and the process 'tokenization'. Here we simply split the string object, whenever there is a white space (you might already think of things that can go wrong here). There are more sophisticated methods to do this but for now it is sufficient. 
 
After obtaining tokens each document is represented as the count of each unique token in the document.

Let's try it out for one tweet first:

<pre><code class="python">example = tweets[4]
print example
</code></pre>

Output:
<pre><code class="python">@faineg @JM_Ashby NEVER treat your opponents with humanity, that's just weakness and ISIS and/or Trump only respects STRENGTHs
</code></pre>

<pre><code class="python">tokens = example.split(' ')
print tokens
</code></pre>

Output:

<pre><code class="python">[u'@faineg', u'@JM_Ashby', u'NEVER', u'treat', u'your', u'opponents', u'with', u'humanity,', u"that's", u'just', u'weakness', u'and', u'ISIS', u'and/or', u'Trump', u'only', u'respects', u'STRENGTHs']
</code></pre>

This works. Now we just have to count how often each token appears per tweet and do it for all tweets. After splitting them we will count how often every word appears and store it in a data structure called `dictionary`. A dictionary works like `json`, that is each entry of the dictionary consists of a key and a value. In our case its `'token': count`.

<pre><code class="python"># Empty list to store the 'bag-of-words' representation of each tweet
bow_tweets = []

# Loop through all tweets
for tweet in tweets:
    
    tokens = tweet.split(' ')
    
    # The tweet will be stored as a dictionary with entries 'token': count
    counts = {}
    
    for token in tokens:
        
        # New entry if token is not yet in dictionary
        # If it's there already, increase the count
        if token in  counts:
            counts[token] += 1        
        else:
            counts[token] = 1
    
    # Store it in the list
    bow_tweets.append(counts)
</code></pre>

This is what it looks like for the first three tweets:


<pre><code class="python">print bow_tweets[0:3]
</code></pre>

Output:
<pre><code class="python">[{u'RT': 1, u'@donnabrazile:': 1, u'https://t.co/SfxHD92gCJ': 1, u'Amazing.': 1}, {u'leave': 1, u'@CLewandowski_': 1, u'off': 1, u'@Miami4Trump': 1, u'people': 1, u'&amp;': 1, u'is': 1, u'Wed': 1, u'ploy': 1, u'name': 1, u'@jwlancasterjr': 1, u'to': 2, u'w/corrected': 1, u'tell': 1, u'vote': 1, u'The': 1, u'ballots': 1, u'@RogerJStoneJr': 1, u'Trump': 1}, {u'RT': 1, u'@Basseyworld:': 1, u'win,': 1, u'Trump': 1, u"don't": 1, u'I': 1, u'together': 1, u'is': 1, u'get': 1, u'it': 1, u'whatever': 1, u'to': 1, u'so': 1, u'a': 1, u'want': 1, u'Dems.': 1, u'hell': 1, u'the': 1, u'Republican': 1, u'or': 1}]
</code></pre>

##### Resources
<hr/>

More sophisticated tokenizers can detect things like it's -> it is and deal correctly with punctuation. They are also able to separate sentences. For python there is the classic [nltk](http://www.nltk.org/) module ([here](http://textminingonline.com/dive-into-nltk-part-ii-sentence-tokenize-and-word-tokenize) is a tutorial on tokenization) and the faster [spaCy](https://spacy.io/). The [scikit-learn](http://scikit-learn.org/stable/) machine learning libraries also have tokenization tools, the [sklearn vectorizers](http://scikit-learn.org/stable/modules/generated/sklearn.feature_extraction.text.CountVectorizer.html). In R you can use [tm](https://cran.r-project.org/web/packages/tm/index.html) or [quanteda](https://cran.rstudio.com/web/packages/quanteda/vignettes/quickstart.html).

For simple tasks like this, there are also some really nice UNIX commandline tools. For exampl: [tr](https://en.wikipedia.org/wiki/Tr_(Unix) and [sed](http://www.grymoire.com/Unix/Sed.html). Check out [UNIX for poets](https://web.stanford.edu/class/cs124/kwc-unix-for-poets.pdf) too.

#### Creating a Document Term Matrix
<hr/>

A lot (but not all) statistical analyses of text are based on Document Term Matrices (DTM). A DTM, as the name says, is a matrix that contains one row per document (in our case a document is all the text for one candidate) and one column per term (or token). Like this:

<pre><code class="python">        token_1 token_2 token_3 ...
tweet_1 4       3       0       ...
tweet_2 0       2       0       ...
tweet_3 3       1       1       ...
...     ...     ...     ...     ...
</code></pre>

That means that each document is represented as a vector in a space that has as many dimensions as there are unique terms in the collection of all documents (the vocabulary of the corpus).

To create the vocabulary we first have to know all the unique tokens in the our collection of tweets. Then we can generate the vector for each tweet.


<pre><code class="python"># Create the vocabulary

# Empty set to store the vocabulary in (sets have a much faster lookup time 
# compared to lists, read about hashmaps if you want to know more, it's genious!)

vocabulary = set()
for tweet in bow_tweets:
    vocabulary.update(tweet.keys())
    
print len(vocabulary)
</code></pre>

Output:
<pre><code class="python">7739
</code></pre>

So we have 7739 unique words in our 1500 tweets. That sounds like a lot. Let's look at a few:


<pre><code class="python">list(vocabulary)[:10]
</code></pre>

Output:
<pre><code class="python">[u'',
u'#BenCarson:',
u'four',
u'Does',
u'@peddoc63',
u'dogshit,',
u'Cruz.....for',
u'@UTHornsRawk',
u'candidates.',
u'https://t.co/nth63AgX5C']
</code></pre>

As we can see from the first few entries there is probably a relatively large amount of words that appear only once. We probalby also don't want `candidate.` and `candidate` to be two separate words... But I'm getting ahead of myself.

Let's make our first term document matrix first and then consider the problems.


<pre><code class="python"># Generate the vectors and store them in a Matrix
import pandas as pd # Module for dataframes

# Create an empty dataframe to hold the data
# Note that this is a very inefficient way to do this. In practice 
# you wouldn't construct a data frame like this but it's good for 
# explaining the concept
dtm = pd.DataFrame(columns = list(vocabulary))

i = 0
for tweet in bow_tweets:
        
    vector = []
    # For each word in the vocabulary check if it is in the tweet
    # if yes, append the count obtained befoe if not append a 0
    for token in dtm.columns:
        if token in tweet:
            vector.append(tweet[token])
        else:
            vector.append(0)
    
    # Append the vector to the matrix as row i
    dtm.loc[i] = vector
    
    # Increase i by one
    i += 1

# Print the dimensions of the matrix
print dtm.shape
</code></pre>

<pre><code class="python">(1521, 7739)

</code></pre>

So now we have a matrix of shape 1521 (number of tweets/documents) x 7739 (number of unique terms). Let's see what this matrix looks like:


<pre><code class="python"># Print out the first few rows
dtm.head()
</code></pre>

<div>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th></th>
      <th>#BenCarson:</th>
      <th>four</th>
      <th>Does</th>
      <th>@peddoc63</th>
      <th>dogshit,</th>
      <th>Cruz.....for</th>
      <th>@UTHornsRawk</th>
      <th>candidates.</th> 
      <th>...</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>...</td>
    </tr>
    <tr>
      <th>1</th>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>...</td>
    </tr>
    <tr>
      <th>2</th>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>...</td>
   </tr>
    <tr>
      <th>3</th>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>...</td>
   </tr>
    <tr>
      <th>4</th>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>...</td>
   </tr>
  </tbody>
</table>
<p>5 rows × 7739 columns</p>
</div>


It's all zeros! Let's see how bad it really is:


<pre><code class="python"># Number of non zero entries
n_non_zero = dtm.astype(bool).sum().sum()

# Totoal number of entries
tot = 1521 * 7739

# Get the percentage of zeros
1 - float(n_non_zero) / float(tot)
</code></pre>

Output:
<pre><code class="python">0.9980055252650599
</code></pre>
{
It is really bad. 99.8% of our matrix is zeros. That means we generated a very big matrix that stores very little information. And most terms only occur once in one document, are therefore useless for comparative analysis. This problem leads us to the next section.

Before that, some resources for term document matrix generation:

The R packages I mentioned above help you generate term document matrices automatically. In python I can recommend the [gensim](https://radimrehurek.com/gensim/) package. It gives you utilities to make document term matrices and fit sophisticated models to your data. However you have to pre-process your the text yourself. Good that you just learned how to do that!

#### The Sparsity Problem
<hr/>

As we suspected before, here is why we have such a sparse matrix. Words that mean the same thing are treated as completely independent dimensions. E.g.:

- Capitalization: 'And', 'and', 'AND'
- Punctuation: 'dog,', 'dog.', 'dog'
- Grammatical inflections: 'walking' vs. 'walked' vs. 'walk'
- Irregular grammatical forms: 'dive', 'dove'
- Typos and other weirdness: 'nad', 'and', 'niiiceee', 'nice'
- unique urls, twitter handles and hashtags
- etc.

This has several problematic consequences:

- Memory requirements
- Processing requirements
- Analytical problems related to sparsity:

Documents that could be considered similar can seem very distant for the computer. E.g. consider three documents:
        1. 'The dog eats a cat'
        2. 'the dogs eat many bananas'
        3. 'I like coffee very much'

The corresponding term document matrix would look like this:

<pre><code class="python">    The dog eats a cat the dogs eat many bananas I like coffee very much
1   1   1   1    1 1   0   0    0   0    0       0 0    0      0    0
2   0   0   0    0 0   1   1    1   1    1       0 0    0      0    0
3   0   0   0    0 0   0   0    0   0    0       1 1    1      1    1
</code></pre>

Calculating the euclidian distance (or any other metric) between the vector for each word shows that they are all equidistant from each other. However, one could argue that documents `1` and `2` are closer to each other than they are to document `3`. We might want to see something like this:

<pre><code class="python">    the dog eat a cat many bananas I like coffee very much
1   1   1   1    1 1  0    0       0 0    0      0    0
2   1   1   1    0 0  1    1       0 0    0      0    0
3   0   0   0    0 0  0    0       1 1    1      1    1
</code></pre>

Now you probably say 'of course, we have to make everything lowercase, remove all the punctuation and stem the tokens and remove all the stopwords'. These steps are often taken as a routine in text analysis applications. In most cases most of these standard pre-processing steps make absolute sense, but I think they should not be done mindlessly. Depending on the analysis some of these things that we remove here might be of value later. For example, capitalization of words might be important to differentiate between proper names and other words. The use of punctuation might be very informative when trying to attribute text to a specific person (don't we all know someone who uses way too many exclamation marks!!!!).

Instead, I will discuss these steps as feature selection or dimensionality reduction techniques. Although they are normally separate steps in the analysis and there are statistical techniques to do them, I think it makes conceptually sense to treat them as the same. Consider using some form of latent factor analysis to retrieve a certian number of factors from the DTM and represent the documents in this reduced space. Although technically different, it is conceptually similar to converting tokens to lower case: We would expect that `Dog` and `dog` are highly correlated in the data because they mean basically the same thing. Therefore, we can represent the two variables as one, that we label `dog` and load with the sum of the old variables.

There are many ways to deal with sparsity, but almost all of them involve reducing the size of the vocabulary, while maintaining as much relevant information as possible. Here is a list of things we can do:

1. Convert all words to lowercase
2. Remove all punctuation, numbers, special characters, etc.
3. Remove very common words that contain little semantic information like: `and`, `or`, `the`, etc. also called *stopwords*
4. Remove very infrequent words. Words that appear only once in the whole corpus are likely typos. Very infrequent words are also not very relevant for statistical analysis (but see above, depending on the analysis and outlier can be very informative).
5. Stemming 
6. Lemmatization
7. Use dimension reduction techniques such as PCA, Factor Analysis, Neural Networks, Topic Models, etc. to locate documents in a [semantic space](https://en.wikipedia.org/wiki/Word_embedding). 
8. Reduce vocabulary by inspecting the information content the words have for a supervise task, for example with $\chi^2$-test
    
For this basic tutorial I will demonstrate just the basics (`1`-`7`) and completely ignore the statistical techniques. I hope to do a more advanced tutorial where I will cover these topics.

Now lets do this. `1`, `2` and `3` can be easily done with regular expressions and standard string tools in every programming language.

#### Dimension Reduction through Text Preprocessing
<hr/>

In this step we will convert everything to lower case and remove all non-letters. We will also remove so called stop words (words like `and`, `the`, `of` that don't contain much meaning but are very frequent). There are some special things in twitter data that we can also remove for now: 
- Many links/urls
- Hashtags
- Handles
- Emojis

They can be as informative as words, or not. They can be removed with regular expressions, see above. I will show how to remove them. The regular expressions I use probably miss a few. It's a lot of trial an error or googling to optimize precision and recall. 


<pre><code class="python"># First generate the regular expressions we compile them so they are quick to use
# repeatedly in the loop below
non_alpha = re.compile(r'[^A-Za-z #@]') # Everything that is not a letter or a space or @ or #
excess_space = re.compile(r' +') # One or more spaces
hasht = re.compile(r'#[^\s$\n]+') # hashtags
hand = re.compile(r'@[^\s$\n]+') # handles
url = re.compile(r'http\S+') # urls

# Load a stopword list from file. You can find those online
stopwords = set(io.open('stopwords.txt', 'r').read().split('\n'))

# List to store the results
clean_tweets = []

for tweet in tweets:
    
    # convert everything to lowercase
    text = tweet.lower()
    
    # Remove handles and hashtags
    text = hasht.sub(' ', text)
    text = hand.sub(' ', text)
    text = url.sub(' ', text)
    
    # Remove stopwords
    text = [w for w in text.split(' ') if w not in stopwords]
    text = ' '.join(text)
    
    # removce non-letters and excess space
    text = non_alpha.sub(repl=' ', string=text)
    text = excess_space.sub(repl=' ', string=text)
    
    clean_tweets.append(text)
</code></pre>

Let's see what that does to an example tweet. The first line is the original tweet the second is the cleaned one:


<pre><code class="python">print tweets[0]
print clean_tweets[0]
</code></pre>

Output:
<pre><code class="python">RT @donnabrazile: Amazing. https://t.co/SfxHD92gCJ
rt amazing 
</code></pre>

Not much left. Now let's regenerate the DTM.

<pre><code class="python"># I will write the DTM generation as a function, because we will re-use it later again and 
# we don't want to write everything three times. This is the same code as above, so I remove
# all comments

def generate_dtm(tweet_list):
    bow_tweets = []
    for tweet in clean_tweets:
        tokens = tweet.split(' ')
        counts = {}
        for token in tokens:
            if token in  counts:
                counts[token] += 1
            else:
                counts[token] = 1
        bow_tweets.append(counts)
    vocabulary = set()
    for tweet in bow_tweets:
        vocabulary.update(tweet.keys())            
    dtm = pd.DataFrame(columns = list(vocabulary))
    i = 0
    for tweet in bow_tweets:
        vector = []
        for token in dtm.columns:
            if token in tweet:
                vector.append(tweet[token])
            else:
                vector.append(0)
        dtm.loc[i] = vector
        i += 1
    return dtm
</code></pre>


<pre><code class="python">new_dtm = generate_dtm(tweet_list=clean_tweets)
</code></pre>


<pre><code class="python">print new_dtm.shape
</code></pre>

Ouput:
<pre><code class="python">(1521, 3308)
</code></pre>

This reduced the number of words by a lot. From over 7000 to 3300! But we can do better. We still didn't solve the problem of gramatical inflections, plurals, etc.

#### Stemming and Lemmatization
<hr/>

Stemming and lemmatization are two techniques to 'normalize' tokens. This is done to avoid differentiating between different grammatical forms of the same word. Consider the three examples: 
    - (walk, walking) 
    - (dive, dove) 
    - (doves, dove)
    - (is, are)
    
The first is simple, the second is an irregular verb and the third is an animal. 

##### Stemming
<hr/>

Stemming algorithms are rule based and operate on the tokens itself. It returns the 'stem' of a word, i.e. without grammatical inflections etc. For the above example it would probably return something like:
    - (walk, walk)
    - (div, dov)
    - (dov, dov)
    - (is, are)
It worked fine in the first place, but stemmers are not able to find the cannonical form (or lemma) of a word. Therefore it failed to figure out the last three cases.

##### Lemmatization
<hr/>

Lemmatization, as the name suggests, is a group of algorithms that allow to find the lemma of a word. It often depends  on the context what the real lemma is (for example `the dove flies` or `I dove into the data`). The context of a word or the function of a word (verb, subject, object, etc.) can be automatically detected. This is called [part-of-speech tagging](https://en.wikipedia.org/wiki/Part-of-speech_tagging). Since it is important where in the sentence a word is located and what other words are around it, lemmatization works better if the algorithm is applied to the text in it's original form (not to text that has punctuation, upper case and stopwords removed for example). 
For the examles above, lemmatization would produce results like this:
    - (walk, walk)
    - (dive, dive)
    - (dove, dove)
    - (be, be)

Let's look at the difference between stemming and lemmatization on an example tweet:


<pre><code class="python"># For stemming and lemmatization we have to rely on modules because it 
# would be to complex for this tutorial to write it from scratch
from spacy.en import English # For lemmatization
import Stemmer # PyStemmer module for stemming 

# INitialize the stemmer
stemmer = Stemmer.Stemmer('english')

# Initialize the spacy parser for lemmatization
parser = English()
</code></pre>

First the stemmer:


<pre><code class="python">text = tweets[262]

print text
print '\n'
tokens = text.split(' ')

# This is some code to nicely print 
# the result and stop after 10 tokens
for i, token in enumerate(tokens):
    print '{} -> {}'.format(token, stemmer.stemWord(token))
    if i == 10:
        break
</code></pre>

Output:
<pre><code class="python">@tyreke977 Bernie has publically stated he doesn't endorse their acts. Trump, on the other hand, offers to pay legal fees? YUGE difference.
     
@tyreke977 -> @tyreke977
Bernie -> Berni
has -> has
publically -> public
stated -> state
he -> he
doesn't -> doesn't
endorse -> endors
their -> their
acts. -> acts.
Trump, -> Trump,
</code></pre>

The first line shows the original tweet. Then below the first 10 words, on the left the original, after the arrow the stemmed token. It does some useful things, for example, `publically` becomes `public` and `stated` becomes `state`. However, we might not want to change `Bernie` to `Berni` and it didn't get that `doesn't` is the same as `does not`.

Let's see what lemmatization does to this tweet:


<pre><code class="python"># Process the text with the spacy parser. 
parsed_text = parser(text)

for i, token in enumerate(parsed_text):
    print '{} -> {}'.format(token.orth_, token.lemma_)
    if i == 13:
        break
</code></pre>

<pre><code class="python">@tyreke977 -> @tyreke977
Bernie -> bernie
has -> have
publically -> publically
stated -> state
he -> he
does -> do
n't -> not
endorse -> endorse
their -> their
acts -> act
. -> .
Trump -> trump
, -> ,
</code></pre>

This looks much better and a little bit like magic. `Bernie` stays `Bernie` it recognizes that `publically` is the adverb and that `doesn't` means `does not`. It also autmatically recogized that the `.` and `,` are not part of the words `Trump` and `act` (note that it realized that `'` belongs to `don't`). It also transformed `has` to its lemma `have`. If you want ot learn more about how it workes [this](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3359276/) paper has an overview of several algorithms. 


Note that, although, you might not see it on only one tweet, this is a lot slower than stemming, because there are some more complex operations happening under the hood. This might be a reason to use stemming if you have a large text collection and just need som rough normalization.

Now let's make our final DTM. We redo all the steps above and add the lemmatization step.


<pre><code class="python"># First the cleaning. We do this again because we first want to lemmatize, when
# we still have the intact tweets and then do the cleaning steps applied above

clean_tweets = []

for tweet in tweets:
   
    # Remove handles and hashtags
    text = hasht.sub(' ', tweet)
    text = hand.sub(' ', text)
    text = url.sub(' ', text)
    
    # Lemmatize
    parsed_text = parser(text)
    text = ' '.join([t.lemma_ for t in parsed_text])
    
    # convert everything to lowercase
    text = text.lower()
    
    # Remove stopwords
    text = [w for w in text.split(' ') if w not in stopwords]
    text = ' '.join(text)
    
    # removce non-letters and excess space
    text = non_alpha.sub(repl=' ', string=text)
    text = excess_space.sub(repl=' ', string=text)
    
    clean_tweets.append(text)
</code></pre>


<pre><code class="python">final_dtm = generate_dtm(tweet_list=clean_tweets)
</code></pre>

Let's see if this made a difference:


<pre><code class="python">print final_dtm.shape
</code></pre>

Output:
<pre><code class="python">(1521, 2805)
</code></pre>

It didn't drastically change the number of words, but at least removed it by about 500. Note also that this reduction is probably very sensible, since lemmas that are the same are probably truly the same. That means we reduced the size of the matrix with little information loss (whereas with the more crude methods of regex removal we actually thre out a bunch of information).

Let's take a look at our final vocabulary:


<pre><code class="python">print final_dtm.columns
</code></pre>

Output:
<pre><code class="python">Index([u'', u'child', u'bear', u'potencialmente', u'drumpf', u'protest',
u'asian', u'controversial', u'hate', u'increase',
...
u'veil', u'gooooooo', u'baker', u'rule', u'cleve', u'determination',
u'yell', u'jivin', u'defend', u'simpson'],
dtype='object', length=2805)
</code></pre>

This looks a lot more sensible than what we saw on the first try. 


<pre><code class="python">final_dtm.head()
</code></pre>

<div>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th></th>
      <th>child</th>
      <th>bear</th>
      <th>potencialmente</th>
      <th>drumpf</th>
      <th>protest</th>
      <th>asian</th>
      <th>controversial</th>
      <th>hate</th>
      <th>increase</th>
      <th>...</th>
   </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>1</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>...</td>
    </tr>
    <tr>
      <th>1</th>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>...</td>
   </tr>
    <tr>
      <th>2</th>
      <td>1</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>...</td>
   </tr>
    <tr>
      <th>3</th>
      <td>1</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>1</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>...</td>
   </tr>
    <tr>
      <th>4</th>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>...</td>
   </tr>
  </tbody>
</table>
<p>5 rows × 2805 columns</p>
</div>


Now this matrix can be used for a variety of analyses. Ranging from simple word counts to sophisticated statistical models.

Even after all these tedious steps, DTMs in most applications will be still very sparse. In a future tutorial I will talk in more detail about this. If you have a big corpus, consider generating a sparse matrix (only non-zero entries are stored) instead of a dense matrix. Many statistical analyses can be done on matrices in sparse format, so you save a lot of time and RAM.
