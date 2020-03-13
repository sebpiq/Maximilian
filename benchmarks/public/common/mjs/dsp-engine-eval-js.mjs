import { NodeTemplate } from './dsp-engine-eval-templates.mjs'

export class ConstantNode extends NodeTemplate {

    constructor(value) {
        super()
        this._createOutputs(1)
        this.setOutput(0, value)
    }

    loop() {
        return ''
    }
}


export class TriangleNode extends NodeTemplate {

    constructor() {
        super()
        this._createOutputs(1)
        this._createState('phase')
        this.setState('phase', 0.0)
    }

    loop(frequency) {
        const phase = this.getStateId('phase')
        const output = this.getOutputId(0)
        return `
    if ( ${phase} >= 1.0 ) ${phase} -= 1.0
    ${phase} += 1 / (SAMPLE_RATE/${frequency})
    if (${phase} <= 0.5 ) {
        ${output} = (${phase} - 0.25) * 4
    } else {
        ${output} = ((1 - ${phase}) - 0.25) * 4
    }`
    }
}


export class BufferNode extends NodeTemplate {

    constructor(bufferSize) {
        super()
        this._createState('buffer')
        this.setState('buffer', new Float32Array(bufferSize))
    }

    loop(input) {
        return `
    ${this.getStateId('buffer')}[BLOCK_FRAME_INDEX] = ${input}`
    }
}


// dspGraph format :
// [
//    [node1, [[nodeInput1A, output1A], ...]]
//    [node2, [[nodeInput2A, output2A], ...]]
// ]
export const render = (dspGraph, config) => {
    const renderedNodes = dspGraph.map(([node, inputs]) => node.renderLoop(inputs))
    return `
BLOCK_FRAME_INDEX = 0
SAMPLE_RATE = ${config.sampleRate}
BLOCK_SIZE = ${config.blockSize}
for (BLOCK_FRAME_INDEX = 0; BLOCK_FRAME_INDEX < BLOCK_SIZE; BLOCK_FRAME_INDEX++) {
    ${renderedNodes.join(';\n')};
}`
}

export const benchmark__SimpleTriangleDspGraph = (config) => {
    const frequency = 40
    const constantNode = new ConstantNode(frequency)
    const triNode = new TriangleNode()
    const bufferNode = new BufferNode(config.blockSize)

    const dspGraph = [
        [triNode, [constantNode, 0]],
        [bufferNode, [triNode, 0]]
    ]

    const dspLoopString = render(dspGraph, config)
    // console.log('COMPILED JS', dspLoopString)
    const dspLoop = new Function(dspLoopString)

    return Promise.resolve((context) => {
        bufferNode.setState('buffer', context.output)
        return dspLoop
    })
}
