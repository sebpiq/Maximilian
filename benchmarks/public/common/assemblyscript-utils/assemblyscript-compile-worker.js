importScripts('/common/assemblyscript-utils/compiler.js')

onmessage = (message) => {
    compileAsc(message.data).then((wasmBinary) => {
        postMessage(wasmBinary)
    })
}