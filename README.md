AlgoRaptor
=======

The idea of the AlgoRaptor project is to create visualizations of famous algorithms in `d3`.

Stepping through visualizations is an excellent and quick way to learn how an algorithm works. Furthermore, having seen the algorithm in action helps in remembering it.

* To see it in action simply visit http://dem42.github.io/algo-raptor/

How do I run it locally?
----------------

First clone this repository using git. Then get `docker` and start the docker daemon. Then 

    > sudo docker pull dem42/algoraptor
    > sudo docker run -p 9000:8999 -v /absolute-path-to-host-algoraptor:/aboslute-path-to-client-algoraptor dem42/algoraptor grunt --gruntfile /aboslute-path-to-client-algoraptor/Gruntfile.js

The last command starts the algoraptor app in docker. The path `/absolute-path-to-host-algoraptor` is where you cloned the algoraptor repository. The path `/aboslute-path-to-client-algoraptor` is where this repository will be mounted in docker.

Alternatively, install npm, grunt and bower and run it locally:

    > sudo apt-get install nodejs
    > sudo apt-get install npm
    > npm install -g grunt-cli
    > npm install -g bower
    > npm install
    > grunt

MIT License
-----------

Copyright (c) 2014 dem42

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
