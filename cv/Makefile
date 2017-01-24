all: html pdf clean

pdf: cv.pdf
cv.pdf: cv.md tex_style.tex
	pandoc --standalone --template tex_style.tex \
	--from markdown --to context \
	-V papersize=A4 \
	-o cv.tex cv.md; \
	context cv.tex

html: index.html
index.html: cv.md head.html
	pandoc --standalone \
        --from markdown --to html \
        -o temp.html cv.md
	cp head.html index.html
	cat temp.html >> index.html
	rm temp.html

clean: cv.tex cv.log
	rm cv.tex
	rm cv.log
	rm cv.tuc
