This is just a little bundle to be able to compile assemblyscript inside a web worker.

The issue is that apparently the assembly script compiler needs `requirejs` to be loaded in the browser, and the rest of our code is built as ES6 modules. Therefore we build everything we need here to test with assemblyscript and use webpack to bundle this all to a `.js` file.