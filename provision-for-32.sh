#!/bin/sh
apt-get update --fix-missing
apt-get install -y emacs

TAR=node-v0.10.30-linux-x86
wget http://nodejs.org/dist/v0.10.30/${TAR}.tar.gz
tar xzf ${TAR}.tar.gz
touch /etc/init/node.conf
chmod 644 /etc/init/node.conf
echo "start on vagrant-ready" >> /etc/init/node.conf
echo "exec sudo /home/vagrant/${TAR}/bin/node /vagrant/server.js > /home/vagrant/algoviz_server.log 2>&1" >> /etc/init/node.conf

# setup the server -- this should use the package.json when we figure it out
cd /vagrant
/home/vagrant/${TAR}/bin/npm install express
/home/vagrant/${TAR}/bin/npm install underscore

#node-v0.10.30-linux-x64/bin/node /vagrant/server.js &
