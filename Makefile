default: compile distribute

# compiles all source files
compile:
	grunt coffee:compile
	grunt jade:compile
	grunt sass:compile

# install all dependencies to run
install:
	gem install sass
	npm install grunt-cli -g
	npm install bower -g
	npm install
	bower install

# watches all files and recompiles them on change
watch: compile
	grunt watch

# Copies the final page into the dist/ folder
distribute:
	grunt distribute
