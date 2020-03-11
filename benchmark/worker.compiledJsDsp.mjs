import { runFunction } from './common/benchmark.mjs'
import { NodeTemplate } from './common/dsp-templates.mjs'

const FREQUENCY = 40


class ConstantNode extends NodeTemplate {

    constructor(value) {
        super()
        this._createOutputs(1)
        this.setOutput(0, value)
    }

    loop() {
        return ''
    }
}


class TriangleNode extends NodeTemplate {

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
            }
        `
    }
}


class BufferNode extends NodeTemplate {

    constructor(bufferSize) {
        super()
        this._createState('buffer')
        this.setState('buffer', new Float32Array(bufferSize))
    }

    loop(input) {
        return `${this.getStateId('buffer')}[BLOCK_FRAME_INDEX] = ${input}`
    }
}


onmessage = (message) => {
    const config = message.data
    const constantNode = new ConstantNode(FREQUENCY)
    const triNode = new TriangleNode()
    const bufferNode = new BufferNode(config.computeIterations)

    // [node, [nodeInput1, ...]]
    const renderedNodes = [
        triNode.renderLoop([constantNode, 0]),
        bufferNode.renderLoop([triNode, 0])
    ]
    
    const dspLoopString = `
        BLOCK_FRAME_INDEX = 0
        SAMPLE_RATE = ${config.sampleRate}
        BLOCK_SIZE = ${config.computeIterations}
        for (BLOCK_FRAME_INDEX = 0; BLOCK_FRAME_INDEX < BLOCK_SIZE; BLOCK_FRAME_INDEX++) {
            ${renderedNodes.join(';\n')}
            ;
        }
    `

    // console.log('COMPILED JS', dspLoopString)
    const output = bufferNode.getState('buffer')
    const dspLoop = new Function(dspLoopString)
    const results = runFunction(dspLoop, config, { output })

    postMessage(results)
}