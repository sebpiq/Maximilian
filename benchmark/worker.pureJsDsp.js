import { runFunction } from './common/benchmark.js'

const FREQUENCY = 40

const SETTINGS = {
    sampleRate: null
}

class ConstantNode {
    constructor(value) {
        this.value = value
    }
    tick() {
        return this.value
    }
}

class TriangleNode {
    constructor() {
        this.phase = 0
    }
    tick(input) {
        if ( this.phase >= 1.0 ) this.phase -= 1.0
        this.phase += 1 / (SETTINGS.sampleRate/input)
        if (this.phase <= 0.5 ) {
            return (this.phase - 0.25) * 4
        } else {
            return ((1 - this.phase) - 0.25) * 4
        }
    }
}

class BufferNode {
    constructor(buffer) {
        this.buffer = buffer
        this.position = 0
    }
    tick(input) {
        this.buffer[this.position] = input
        this.position++
    }
}

function pureJsDsp({ computeIterations, sampleRate }, { dspNodes }) {
    let i, j
    for (i = 0; i < computeIterations; i++) {
        let output = null
        for (j = 0; j < dspNodes.length; j++) {
            output = dspNodes[j].tick(output)
        }
    }
}

onmessage = (message) => {
    const config = message.data
    SETTINGS.sampleRate = config.sampleRate
    const output = new Float32Array(config.computeIterations)
    const dspNodes = [
        new ConstantNode(FREQUENCY),
        new TriangleNode(),
        new BufferNode(output)
    ]
    postMessage(
        runFunction(pureJsDsp, config, { 
            dspNodes, output
        })
    )
}