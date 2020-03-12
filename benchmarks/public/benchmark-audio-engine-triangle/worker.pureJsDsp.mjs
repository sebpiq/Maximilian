import { runFunction } from '/common/mjs/benchmarking-utils.mjs'
import { ConstantNode, TriangleNode, BufferNode, run, setSettings } from '/common/mjs/dsp-engine-pure-js.mjs'

const FREQUENCY = 40

function pureJsDsp({ blockSize }, { dspGraph }) {
    run(blockSize, dspGraph)
}

onmessage = (message) => {
    const config = message.data
    setSettings({ sampleRate: config.sampleRate })
    const output = new Float32Array(config.blockSize)
    const constantNode = new ConstantNode(FREQUENCY)
    const triNode = new TriangleNode()
    const bufferNode = new BufferNode(output)
    const dspGraph = [
        [constantNode, []],
        [triNode, [constantNode]],
        [bufferNode, [triNode]]
    ]
    postMessage(
        runFunction(pureJsDsp, config, { 
            dspGraph, output
        })
    )
}