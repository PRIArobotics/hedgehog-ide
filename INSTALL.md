## Installation from source on the Hedgehog controller

In order to install the Hedgehog IDE on the Hedgehog controller, you first need to install Node.JS.
To do so, open a terminal connection to your Hedgehog's Raspberry Pi, and type the following.
```bash
$ wget https://nodejs.org/dist/latest/node-v7.4.0-linux-armv6l.tar.xz
$ tar -xvf node-v7.4.0-linux-armv6l.tar.xz
$ sudo cp -R node-v7.4.0-linux-armv6l/* /usr/local/
$ sudo apt install libssl-dev libzmq-dev
```

Now with Node ready to go, we can move on the environment setup for the Hedgehog IDE.
```bash
$ git clone https://github.com/PRIArobotics/hedgehog-ide.git 
$ hedgehog-ide
$ npm install
$ ./node_modules/typings/dist/bin.js install
$ ./node_modules/grunt/bin/grunt build
```

That's it! Run the IDE with the following command.
```bash
$ npm start
```
