import { runFunction } from '/common/mjs/benchmarking-utils.mjs'
import { ConstantNode, TriangleNode, BufferNode, render } from '/common/mjs/dsp-engine-eval-js.mjs'

const FREQUENCY = 40

onmessage = (message) => {
    const config = message.data
    const constantNode = new ConstantNode(FREQUENCY)
    const triNode = new TriangleNode()
    const bufferNode = new BufferNode(config.blockSize)

    const dspGraph = [
        [triNode, [constantNode, 0]],
        [bufferNode, [triNode, 0]]
    ]

    const dspLoopString = render(dspGraph, config)
    // console.log('COMPILED JS', dspLoopString)
    const output = bufferNode.getState('buffer')
    const dspLoop = new Function(dspLoopString)
    const results = runFunction(dspLoop, config, { output })

    postMessage(results)
}