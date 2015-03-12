AlgoRaptor
=======

The idea of the AlgoRaptor project is to create visualizations of famous algorithms in `d3`.

Stepping through visualizations is an excellent and quick way to learn how an algorithm works. Furthermore, having seen the algorithm in action helps in remembering it.

* To see it in action simply visit http://dem42.github.io/algo-raptor/

How do I run it locally?
----------------

1. Get `docker`
2. Get `dockerfile/nodejs-bower-grunt`
3. Start the docker daemon
4. `sudo docker run -i -t dockerfile/nodejs-bower-grunt /bin/bash`
5. `apt-get update`
6. `apt-get install libfontconfig1 fontconfig libfontconfig1-dev libfreetype6-dev`
7. `git clone https://github.com/dem42/algo-raptor.git`
8. `cd algo-raptor`
9. `npm install`
10. exit docker shell
11. `sudo docker run -d -p 8999:8999 dockerfile/nodejs-bower-grunt grunt --base /data/algo-raptor`
