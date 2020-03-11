Benchmarks
============

From project root, run the following to build the docker container:

```
docker build -t benchmarks -f benchmarks/Dockerfile .
```

Start container:

```
docker run -it benchmarks -p 8080:8080
```

Open your browser to the docker address (displayed in the console by the server)


assemblyscript/
-----------------

This is just a little bundle to be able to compile assemblyscript inside a web worker.

The issue is that apparently the assembly script compiler needs `requirejs` to be loaded in the browser, and the rest of our code is built as ES6 modules. Therefore we build everything we need here to test with assemblyscript and use webpack to bundle this all to a `.js` file.


cpp/
------

A bunch of simple custom C++ dsp libraries which we compile with emscripten.


public/
---------

This is where all the frontend files live. We also symlink under `common/` all built assets from the `cpp/` and `assemblyscript/` folders.