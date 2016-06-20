default: compile distribute

# compiles all source files
compile:
	grunt compile

# install all dependencies to run
install:
	gem install sass
	npm install grunt-cli -g
	npm install bower -g
	npm install
	bower install

# watches all files and recompiles them on change
development:
	grunt development

# Copies the final page into the dist/ folder
distribute:
	grunt distribute
