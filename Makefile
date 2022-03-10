make:
	mkdir tmp

clean:
	rm -rf tmp

zip:
	zip -r pkg.zip files logs tmp .env choosePalette.js index.js lambda_handler.js uploadS3.js package.json package-lock.json

zip2:
	zip -rq pkg.zip .