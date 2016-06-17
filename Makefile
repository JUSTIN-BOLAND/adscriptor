# compiles all source files
compile:
	grunt coffee:compile
	grunt jade:compile
	grunt sass:compile

# Installs all needed dependencies
install:
	# ruby & sass gem are needed to compile sass
	gem install sass
	# Install npm & bower dependencies
	npm install grunt -g
	npm install bower -g
	npm install
	bower install



# watches for changes and re-compiles on-the-fly
watch:
	grunt watch