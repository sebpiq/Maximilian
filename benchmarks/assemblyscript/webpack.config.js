const path = require('path');

module.exports = {
    entry: {
        compiler: './compiler.js',
        loader: './loader.mjs'
    },
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: (chunkData) => {
            return chunkData.chunk.name === 'compiler' ? 'compiler.js': 'loader.mjs';
        },
    }
};