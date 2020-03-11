import { runFunction } from './common/benchmark.mjs'

const FREQUENCY = 40

const SETTINGS = {
    sampleRate: null
}

class ConstantNode {
    constructor(value) {
        this.value = value
        this.outputs = new Float32Array([value])
    }
    tick() {}
}

class TriangleNode {
    constructor() {
        this.phase = 0
        this.outputs = new Float32Array(1)
    }
    tick(inputNodes) {
        if ( this.phase >= 1.0 ) this.phase -= 1.0
        this.phase += 1 / (SETTINGS.sampleRate/inputNodes[0].outputs[0])
        if (this.phase <= 0.5 ) {
            this.outputs[0] = (this.phase - 0.25) * 4
        } else {
            this.outputs[0] = ((1 - this.phase) - 0.25) * 4
        }
    }
}

class BufferNode {
    constructor(buffer) {
        this.buffer = buffer
        this.position = 0
    }
    tick(inputNodes) {
        this.buffer[this.position] = inputNodes[0].outputs[0]
        this.position++
    }
}

function pureJsDsp({ computeIterations }, { dspGraph }) {
    let i, j
    for (i = 0; i < computeIterations; i++) {
        for (j = 0; j < dspGraph.length; j++) {
            dspGraph[j][0].tick(dspGraph[j][1])
        }
    }
}

onmessage = (message) => {
    const config = message.data
    SETTINGS.sampleRate = config.sampleRate
    const output = new Float32Array(config.computeIterations)
    const constantNode = new ConstantNode(FREQUENCY)
    const triNode = new TriangleNode()
    const bufferNode = new BufferNode(output)
    // [node, [nodeInput1, ...]]
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