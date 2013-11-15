Clover Dasboard - Reporting App
======

# Getting Started

## Installing Dependencies

1. __Install NodeJS__

    Instructions: https://github.com/joyent/node/wiki/Installing-Node.js-via-package-manager#ubuntu-mint

2. __Install MongoDB__

    Instructions: http://docs.mongodb.org/manual/installation/

3. __Get the code__

        $ mkdir [clover_app] && cd [clover_app]
        $ git clone https://stash.r.mutualmobile.com/scm/clov/clover.git .

4. __Install grunt-cli globally__

    Note: this may require sudo

        $ npm install -g grunt-cli

5. __Install dev dependencies for our tasks to work__

        $ npm install


## Running Locally

1. __Start MongoDB Server__

    If you have not set your MongoDB server to run at startup, you'll need to run it manually.

        $ mongod

2. __Start Development Server__

    If you started MongoDB manually, make sure to run this command in a seperate shell.

        $ grunt

    Your application should now be running on `localhost:8080`.


## Deploying to Production

1. __Build Production__

        $ grunt build:production

2. __Install Forever for Production Server__

    Note: Forever will only need to be installed once. After it is installed, you can skip this step for subsequent deployments.

        $ npm install -g forever

3. __Run MongoDB Server__

    If you have not set your MongoDB server to run at startup, you'll need to run it manually.

        $ mongod

4. __Run Production Server__

        $ forever start index.js


## Grunt Tasks

Below is a list of grunt tasks to aid development and facilitate deployment.

### Default

A task that concurrently runs a static server for local development and watches less files. Server defaults to run on `localhost:8080` with `src` being the root directory.

- __Run the default static server and watch less__


        $ grunt


### Server

A task that simply runs a static server for local development and testing. Defaults to run on `localhost:8080` with `src` being the root directory.

- __Run the default static server__


        $ grunt server


### Build

Precompiles LESS and Dust templates, concats and minifies all CSS and JavaScript files, and builds all related files to the `www` directory.

- __Build with local config__


        $ grunt build


- __Build with staging config__ (a copy of the build will be available in `www` folder)


        $ grunt build:staging


- __Build with production config__ (a copy of the build will be available in `www` folder)


        $ grunt build:production


### Test

Runs unit tests defined in `test/unit` directory with [Jasmine](http://pivotal.github.com/jasmine/) in a headless instance of Webkit using [PhantomJS](http://phantomjs.org/).

- __Run unit tests from `test/unit`__


        $ grunt test


### Docs

Generates JavaScript documentation using [yuidoc](https://github.com/gruntjs/grunt-contrib-yuidoc). The resulting documentation is outputed to the `doc` folder.

- __Generate JavaScript Documentation__


        $ grunt yuidoc