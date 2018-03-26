import time
with open('cv.md', 'r') as infile, open('cv_dated.md', 'w') as outfile:
    text = infile.read()
    date = time.strftime("%m/%d/%Y")
    out_text = text.format(update_date = date)
    outfile.write(out_text)
