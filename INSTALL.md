# Installation on the Hedgehog controller
In order to install the Hedgehog IDE on the Hedgehog controller, you first need to install Node.JS.
To do so, open a terminal connection to your Hedgehog's Raspberry Pi, and type the following.
```bash
$ wget https://nodejs.org/dist/latest/node-v7.4.0-linux-armv6l.tar.xz
$ tar -xvf node-v7.4.0-linux-armv6l.tar.xz
$ sudo cp -R node-v7.4.0-linux-armv6l/* /usr/local/
$ sudo apt install libssl-dev libzmq-dev
```
Now you can either install a release which the recommended way or build the IDE from source.

### Installing a release
Simply download the latest release to your controller:
```bash
$ wget https://github.com/PRIArobotics/hedgehog-ide/releases/download/v0.2-beta/hedgehog-ide-v0.2.0-beta-linux-armv6l.tar.gz
$ tar -xf  hedgehog-ide-v0.2.0-beta-linux-armv6l.tar.gz
```

### Building from source
If you want the latest version development version of the IDE you can also clone the repository and build it from source:
```bash
$ git clone https://github.com/PRIArobotics/hedgehog-ide.git 
$ hedgehog-ide
$ npm install
$ ./node_modules/typings/dist/bin.js install
$ ./node_modules/grunt/bin/grunt build
```

## Configuration
An example configuration can be found under `config/server.config.example.js`, in order to use that file, just copy it to `config/server.config.js`.
The IDE will run with this default configuration, nevertheless, all options are documented, making it simple to adapt it for your needs.

**If have downloaded a release make sure the `environment` option is set to `'production'`!**

That's it! Run the IDE with the following command.
```bash
$ npm start
```

## Setup systemd service
However, normally you do not want to start the IDE manually every time but rather use a systemd service.
Hedgehog IDE already comes with the service script you just need to enable it:
```bash
$ cp ~/hedgehog-ide/systemd/hedgehog-ide.service /lib/systemd/system
$ systemctl start hedgehog-ide.service
$ systemctl enable hedgehog-ide.service
```
Now Hedgehog IDE should run in background and will also automatically start on boot.
