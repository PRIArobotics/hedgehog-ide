# hedgehog-ide
[![Build Status](https://travis-ci.org/PRIArobotics/hedgehog-ide.svg?branch=master)](https://travis-ci.org/PRIArobotics/hedgehog-ide)

Hedgehog IDE and Deployment Protocol

## Development
### Tools
For following tools are used for development the Hedgehog IDE.
Thus, if you want to start working on the IDE, you will need to install them first.
- Dependency Management: [NPM](https://www.npmjs.com/)
- Build Automation: [Grunt](http://gruntjs.com/)
- Typings Management: [Typings](https://github.com/typings/typings)
- Testing: [Mocha](http://mochajs.org/)
- Linting: [TSLint](https://palantir.github.io/tslint/) (Available via Grunt task. No installation required!)
 
### Setup
```
$ npm install     # Install required NPM modules
$ typings install # Install TypeScript type definitions
```

### Running tests
In order to execute all tests, simply execute:
```
$ npm test
```

### Coding Styleguide
Code is linted via TSLint.
Read the [styleguide entry](https://github.com/PRIArobotics/hedgehog-ide/wiki/Styleguide) in the project's wiki.