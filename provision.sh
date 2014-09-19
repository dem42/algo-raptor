#!/bin/sh
apt-get update --fix-missing
apt-get install -y emacs

wget http://nodejs.org/dist/v0.10.30/node-v0.10.30-linux-x64.tar.gz
tar xzf node-v0.10.30-linux-x64.tar.gz
cp /vagrant/node.conf /etc/init/node.conf

# setup the server -- this should use the package.json when we figure it out
cd /vagrant
node-v0.10.30-linux-x64/bin/npm install express
node-v0.10.30-linux-x64/bin/npm install underscore

#node-v0.10.30-linux-x64/bin/node /vagrant/server.js &
