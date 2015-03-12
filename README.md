AlgoRaptor
=======

The idea of the AlgoRaptor project is to create visualizations of famous algorithms in `d3`.

Stepping through visualizations is an excellent and quick way to learn how an algorithm works. Furthermore, having seen the algorithm in action helps in remembering it.

* To see it in action simply visit http://dem42.github.io/algo-raptor/

How do I run it locally?
----------------

First clone this repository using git. Then get `docker` and start the docker daemon. Then 

    > sudo docker pull dem42/algoraptor
    > sudo docker run -p 9000:8999 -v /absolute-path-to-host-algoraptor:/aboslute-path-to-client-algoraptor algoraptor grunt --gruntfile /aboslute-path-to-client-algoraptor/Gruntfile.js

The last command starts the algoraptor app in docker. The path `/absolute-path-to-host-algoraptor` is where you cloned the algoraptor repository. The path `/aboslute-path-to-client-algoraptor` is where this repository will be mounted in docker.

