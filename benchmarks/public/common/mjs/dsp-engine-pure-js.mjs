// Simple dynamic dsp engine implemented in pure JS:
// - per-sample processing

const CONTEXT = {
    sampleRate: null,
    currentFrameInBlock: 0,
}

export const setSettings = (settings) => {
    Object.assign(CONTEXT, settings)
}

export class ConstantNode {
    constructor(value) {
        this.value = value
        this.outputs = new Float32Array([value])
    }
    tick() {}
}

export class TriangleNode {
    constructor() {
        this.phase = 0
        this.outputs = new Float32Array(1)
    }
    tick(inputNodes) {
        if ( this.phase >= 1.0 ) this.phase -= 1.0
        this.phase += 1 / (CONTEXT.sampleRate/inputNodes[0].outputs[0])
        if (this.phase <= 0.5 ) {
            this.outputs[0] = (this.phase - 0.25) * 4
        } else {
            this.outputs[0] = ((1 - this.phase) - 0.25) * 4
        }
    }
}

export class BufferNode {
    constructor(buffer) {
        this.buffer = buffer
    }
    tick(inputNodes) {
        this.buffer[CONTEXT.currentFrameInBlock] = inputNodes[0].outputs[0]
    }
}

// dspGraph : [
//    [node1, [nodeInput1A, ...]],
//    [node2, [nodeInput2A, ...]],
// ]
export function run(blockSize, dspGraph) {
    let j
    for (CONTEXT.currentFrameInBlock = 0; CONTEXT.currentFrameInBlock < blockSize; CONTEXT.currentFrameInBlock++) {
        for (j = 0; j < dspGraph.length; j++) {
            dspGraph[j][0].tick(dspGraph[j][1])
        }
    }
}

export const benchmark__SimpleTriangleDspGraph = (config) => {
    const frequency = 40
    setSettings({ sampleRate: config.sampleRate })
    const constantNode = new ConstantNode(frequency)
    const triNode = new TriangleNode()
    const bufferNode = new BufferNode()
    const dspGraph = [
        [constantNode, []],
        [triNode, [constantNode]],
        [bufferNode, [triNode]]
    ]
    return Promise.resolve((context) => {
        bufferNode.buffer = context.output
        return run.bind(this, config.blockSize, dspGraph)
    })
}