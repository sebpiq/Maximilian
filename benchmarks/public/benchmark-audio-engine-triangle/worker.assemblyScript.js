importScripts('/common/js/assemblyscript/assemblyscript.js')

const FREQUENCY = 40

function dspLoop({ blockSize }, { dspModule }) {
    dspModule.loop()
}

onmessage = (message) => {
    const config = message.data
    const constantNode = new ConstantNode(FREQUENCY)
    const triNode = new TriangleNode()
    const bufferNode = new BufferNode(config.blockSize)

    // [node, [nodeInput1, ...]]
    const dspGraph = [
        [constantNode, []],
        [triNode, [[constantNode, 0]]],
        [bufferNode, [[triNode, 0]]]
    ]

    const dspLoopString = render(dspGraph, config)
    // console.log(dspLoopString)

    // Module loaded uses : https://docs.assemblyscript.org/basics/loader
    initializeAsc().then(() => {
        const startDate = self.performance.now()
        const promise = loadAsc(dspLoopString)
        console.log(`compile time : ${(self.performance.now() - startDate)} ms`)
        return promise

    }).then((dspModule) => {
        const output = dspModule.__getFloat32ArrayView(dspModule[bufferNode.getStateId('getBufferPointer')]())
        const results = runFunction(dspLoop, config, { output, dspModule })
        postMessage(results)
    })
}