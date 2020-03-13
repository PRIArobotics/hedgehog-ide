# Installation on the Hedgehog controller

**With version 1.0.0, Hedgehog IDE has been integrated into [HedgehogBundle](https://github.com/PRIArobotics/HedgehogBundle).**

## Automated installation with HedgehogBundle (recommended)

HedgehogBundle allows a very simple installation of the Hedgehog platform, the IDE can be installed via a single command.
After cloning or downloading the bundle to the controller, simply enter the following two commands in the `HedgehogBundle` directory:

```bash
$ cd ide
$ make
```

Now you are all set! The IDE should be running on port 80 of your controller and will be automatically started on boot.


## Manual installation (only for advanced users)

In order to install the Hedgehog IDE manually on the Hedgehog controller, you first need to install Node.JS.
To do so, open a terminal connection to your Hedgehog's Raspberry Pi.
We recommend NVM for installing a node version:

```bash
$ sudo aptitude -y install libssl-dev libzmq-dev libcurl4-gnutls-dev
$ curl -L https://raw.githubusercontent.com/creationix/nvm/master/install.sh | bash

$ export NVM_DIR="$HOME/.nvm"
$ . "$NVM_DIR/nvm.sh"
$ nvm install 7.9.0
```

Alternatively, download and install a distribution manually:

```bash
$ sudo apt install libssl-dev libzmq-dev libcurl4-gnutls-dev
$ wget https://nodejs.org/dist/v7.9.0/node-v7.9.0-linux-armv6l.tar.xz
$ tar -xvf node-v7.9.0-linux-armv6l.tar.xz
$ sudo cp -R node-v7.9.0-linux-armv6l/* /usr/local/
```

Now you have the following options:
- install an official release of the Hedgehog IDE
- run the IDE in development mode
- build the IDE from source and prepare a release

In each case, you will need to apply the correct configuration and set the `environment` option correctly.

### Installing a release

Simply download and unpack the latest release to your controller:

```bash
$ wget https://github.com/PRIArobotics/hedgehog-ide/releases/download/v1.3.0/hedgehog-ide-1.3.0-linux-armv7l.tar.gz
$ tar -xf hedgehog-ide-1.3.0-linux-armv7l.tar.gz
```

Your configuration needs to use `environment: 'production',`.

### working with the IDE sources

If you want the latest version development version of the IDE you can also clone the repository and install dependencies like this:

```bash
$ git clone https://github.com/PRIArobotics/hedgehog-ide.git
$ cd hedgehog-ide
$ npm install
```

### development mode

If you plan to work on the IDE itself and test changes frequently, this is what you want.
The command will start a server and apply updates to any files automatically.

```bash
$ npm run develop
```

Your configuration needs to use `environment: 'debug',`.

### production mode

If you want to build an optimized production build of the IDE, this is the right way.
The commands here will first build a Hedgehog IDE release, and then start the webserver.

```bash
$ npm run release
$ npm start
```

Your configuration needs to use `environment: 'production',`.

## Configuration

An example configuration can be found under `config/server.config.example.js`.
In order to use that file, just copy it to `config/server.config.js`.
The IDE will run with this default configuration.
Nevertheless, all options are documented, making it simple to adapt it for your needs.

**Make sure the `environment` option is set correctly!**
