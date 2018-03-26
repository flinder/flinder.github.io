all: html pdf clean

pdf: cv.pdf

cv_dated.md: cv.md
	python add_compile_date.py

cv.pdf: cv_dated.md tex_style.tex
	pandoc --standalone --template tex_style.tex \
	--from markdown --to context \
	-V papersize=A4 \
	-o cv.tex cv_dated.md; \
	context cv.tex

html: index.html
index.html: cv_dated.md head.html
	pandoc --standalone \
        --from markdown --to html \
        -o temp.html cv_dated.md
	cp head.html index.html
	cat temp.html >> index.html
	rm temp.html

clean: 
	rm -f cv.tex
	rm -f cv.log
	rm -f cv.tuc
	rm -f cv_dated.md
