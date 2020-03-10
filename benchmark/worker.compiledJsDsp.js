import { runFunction } from './common/benchmark.js'

const FREQUENCY = 40
const NODE_PREFIX = 'Node'
const OUTPUT_PREFIX = 'Out'
const STATE_PREFIX = 'State'

let SAMPLE_RATE

let BLOCK_FRAME_INDEX = 0
let BLOCK_SIZE

let NODE_ID_COUNTER = -1

class Node {
    
    constructor() {
        NODE_ID_COUNTER++
        this.id = `${NODE_PREFIX}${NODE_ID_COUNTER}`
        this._outputIds = []
        this._stateIds = {}
    }
    
    render(...connections) {
        const outputIds = connections.map(
            ([sourceNode, outputPosition]) => sourceNode.getOutputId(outputPosition))
        return this.dspString(...outputIds)
    }

    getOutputId(outputPosition) {
        return this._outputIds[outputPosition]
    }

    getStateId(name) {
        const stateId = this._stateIds[name]
        if (!stateId) {
            throw new Error(`Unknown state "${name}"`)
        }
        return stateId
    }

    getState(name) {
        return self[this.getStateId(name)]
    }

    setState(name, value) {
        self[this.getStateId(name)] = value
    }

    setOutput(outputPosition, value) {
        self[this.getOutputId(outputPosition)] = value
    }

    _createOutputs(count) {
        for (let i = 0; i < count; i++) {
            this._outputIds.push(`${this.id}__${OUTPUT_PREFIX}${i + 1}`)
        }
    }

    _createState(name) {
        this._stateIds[name] = `${this.id}__${STATE_PREFIX}${name}`
    }
}


class ConstantNode extends Node {

    constructor(value) {
        super()
        this._createOutputs(1)
        this.setOutput(0, value)
    }

    dspString() {
        return ''
    }
}


class TriangleNode extends Node {

    constructor() {
        super()
        this._createOutputs(1)
        this._createState('phase')
        this.setState('phase', 0.0)
    }

    dspString(frequency) {
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


class BufferNode extends Node {

    constructor(bufferSize) {
        super()
        this._createState('buffer')
        this.setState('buffer', new Float32Array(bufferSize))
    }

    dspString(input) {
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
        triNode.render([constantNode, 0]),
        bufferNode.render([triNode, 0])
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

    // console.log(dspLoopString)
    const output = bufferNode.getState('buffer')
    const dspLoop = new Function(dspLoopString)
    const results = runFunction(dspLoop, config, { output })

    postMessage(results)
}