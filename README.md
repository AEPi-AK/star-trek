# Booth Tech

Dear Future Reader,

This README was written to preserve the hashtag institutional knowledge of the technological geniuses
in AEPi. It includes how to set up Raspberry Pis minimally for booth, installing TypeScript and related
tools, and an explanation and rationale for our heavy use of Socket.io.

## Table of Contents

1. [Components](#components)
2. [Setting up your Pi](#setting-up-your-pi)
3. [Setting up TypeScript](#setting-up-typescript)
4. [Developing for the Pi](#developing-for-the-pi)
5. [Socket.io](#socketio)
6. [Misc tidbits and tips](#misc-tips)

## Components

The base booth tech kit comes with:

* Raspberry Pi
* Micro SD card
* Micro SD card reader
* Power supply
* Micro USB cable

You will need all of these things to continue.

## Setting up your Pi

If you were given a Pi that was already set up, you can skip this section.

If you are the one setting up the Pis, you might find this section helpful.

These instructions were written specifically for Mac.

1. Download [Etcher](https://etcher.io/)
2. Download [Raspbian](https://www.raspberrypi.org/downloads/raspbian/) (it may be faster to use the torrent download)
   * If you don't need the desktop, I recommend going with lite.
3. Put the Micro SD card into the reader
4. Plug the reader into your computer
5. Open Etcher
6. Select the zip of Raspbian
7. Select the reader as the storage device
8. Flash!
9. Plug a keyboard (via USB), mouse (via USB), screen (via HDMI), and the Micro SD card into your pi.
   * The micro SD card should be taken out of the reader and put into the pie directly. The slot is on the bottom.
10. If you are at CMU and plan to use the internet on the Pi, [you'll need to register its MAC address](https://netreg.net.cmu.edu/)
    1. Click Enter
    2. Click Register New Machine
    3. In the first dropdown, select Legacy Wireless Network and then click continue
    4. Type whatever you want for the hostname.
    5. On the Pi, open up the Terminal and type `ifconfig`
    6. Type the MAC address (should look like AA:BB:CC:DD) into the Hardware address box
    7. Select Student Organization under affiliation
    8. Click continue
    9. In about 30 minutes, you should be able to access the internet from the Pi.
11. Try to open chromium on your pi. If it doesn't let you access the internet after waiting for 30 minutes, follow this [SO answer](https://raspberrypi.stackexchange.com/a/47715).
    * Instead of internationalistation options, you'll want localisation options.
12. Set up the Pi SSH and VNC servers
    1. Run `sudo rapsi-config` in a terminal window
    2. Select `Interfacing Options`
    3. Navigate to and select `SSH`
    4. Choose `Yes`
    5. Select `Ok`
    6. Do the same for `VNC`
    7. Choose `Finish`
    8. Now you can ssh onto the pi by connecting to it via ethernet and 
       running `ssh pi@raspberrypi.local`. The password is `raspberry` by
       default.
    9. You can also connect to the Pi with VNC. See 
       `https://www.raspberrypi.org/documentation/remote-access/vnc/README.md`
       for more information.
13. Set up typescript + node on the Pi
    1. curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
    2. Install node, `sudo apt-get install node`
    3. Install TypeScript, `sudo npm install -g typescript`
    4. Install nodemon, `sudo npm install -g nodemon`
14. Set up Samba on the pi
    1. `sudo apt-get install samba samba-common-bin`
    2. `sudo smbpasswd -a pi`
    3. `nano /etc/samba/smb.conf`
    4. Edit the file to read as [SambaConfig](/setup/SambaConfig)
    5. `service smbd restart`
    6. Now, you may access the Pi's file system from your mac. Open finder
       -> Go -> Connect to Server
       * (This should also work [for windows](https://raspberrypihq.com/how-to-share-a-folder-with-a-windows-computer-from-a-raspberry-pi/))
       * (And Linux)[https://help.ubuntu.com/community/How%20to%20Create%20a%20Network%20Share%20Via%20Samba%20Via%20CLI%20%28Command-line%20interface/Linux%20Terminal%29%20-%20Uncomplicated,%20Simple%20and%20Brief%20Way!]
    7. Set the server to `smb://<piname>.local`
       * By default, piname is raspberrypi

You now have a linux machine on which you may begin developing.

## Setting up TypeScript

TypeScript is a type-safe superset of JavaScript with a badass community and development environment. All of the booth programming
can be done locally using Samba, so you should follow these instructions on your local machine.

[Getting VS Code](https://code.visualstudio.com/)
[Setting up TypeScript](https://code.visualstudio.com/docs/languages/typescript)

## Developing for the Pi

We use Samba to ease the development process. I recommend connecting to the pi via ethernet, but you can also access it using
its IP address. Your pi should also be connected to wifi so it can download external dependencies.

You'll want to use VS Code to edit TypeScript files. I know I know, you really wanted to use `EDITORNAMEHERE` to work on booth,
but trust me, VC Code is great.

Since we set up Samba, you should be able to open up the project on your pi inside VS Code. Any changes you make to these
files will be reflected via Samba to your pi.

Within VS Code, open up a terminal window and ssh onto your pi (`ssh pi@<pi name>.local`).
`cd` into your project folder. You'll want to make sure that you install dependencies while on the Pi, just in case
there are system specific compilation processes. You should also run the program while SSH'd onto the pi, since Samba will use
your local version of node instead of the version on the pi.

With this setup, you'll be able to use your local environment to develop while still getting to run your code on the pi!

## Socket.io

Socket IO is essentially a distributed implementation of the observer design pattern.
The basic premise is that instead of being responsible for repeatedly checking the state of a server,
you can just set up "listeners" (which are just functions) that react to certain messages. An example of
a message is the message that comes in when a user connects to the server. Something listening to that message
may add that user to a list of active users, send the user a message, or continue listening to messages from that user.

Let's take a look at an example:


```typescript
server.ts

import Express = require('express');
import Http = require('http');
import IO = require('socket.io');

var app = Express();
var http = new Http.Server(app);
var io = IO(http);

// When a user connects, wait for them to identify themselves. Print
// to the console when they disconnect.
// Note: 'connect' and 'disconnect' are built in messages that are automatically
// sent when a connection is created and disconnected, respectively
io.on('connect', function(socket: SocketIO.Socket){
  var name: null | string = null;
  console.log('a user connected: ' + socket.id);

  socket.on('disconnect', function () {
    if (name) console.log(name + ' disconnected');
    else console.log(socket.id + ' disconnected');
  });

  // 'identification' is our own custom message. We expect a string to be supplied.
  socket.on('identification', function (data: string) {
    if (name === null) {
     console.log('user ' + socket.id + ' identified as ' + data);
     name = data;
    }
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
```

This code doesn't just execute top down like you may expect. This code tells the server to continually listen
for these messages. Specifically, always listen for a user to connect. When they do, always listen for them to identify
themselves, and note when they disconnect. We do not need to put our code in a loop -- this code says to start listening
and then proceeds on asynchronously.

The client to a server may look something like this:

```typescript
client.ts

import Socket = require('socket.io-client');
import Readline = require('readline');

var socket = Socket('http://localhost:3000');

const rl = Readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

rl.question('What is your name? ', (answer) => {
  // Sends an identification message to the server.
  socket.emit('identification', answer);
  rl.close();
});
```

This client connects to the server, takes a name as input from STDIN, and tells the server the name. On the server side,
it received a `'connect'` message, since the client made a connection to the server, and an `'identification'` message that
the client explicitly sends.

### Why do you care?

Traditionally (by this, I of course mean the 2017 & 2018 golden years of booth game), the master server in the booth keeps track of
game state while a bunch of Rasperry Pis control several mini-games throughout the booth react to changes in the game state. Some Raspberry Pis will also send messages to the server, and are the driving force behind many of these game state changes. This kind
of design is extremely well-modeled by socket.io -- just listen for a `gamestate changed` message and react accordingly; no need to
poll periodically! Similarly, to update the gamestate the server can just listen for updates and propagate those updates by broadcasting
a `gamestate changed` message.

## Misc Tips

* You will not be able to use anything that requries Internet access at runtime-- we will only have access to each other's machines via our LAN network.
* The most important thing is robustness. Make sure your pi will not crash under any circumstances.
