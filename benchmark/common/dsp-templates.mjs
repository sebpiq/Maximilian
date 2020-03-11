const NODE_PREFIX = 'Node'
const OUTPUT_PREFIX = 'Out'
const STATE_PREFIX = 'State'

let NODE_ID_COUNTER = -1

export class NodeTemplate {
    
    constructor() {
        NODE_ID_COUNTER++
        this.id = `${NODE_PREFIX}${NODE_ID_COUNTER}`
        this._outputIds = []
        this._stateIds = {}
    }
    
    renderLoop(...connections) {
        const outputIds = connections.map(
            ([sourceNode, outputPosition]) => sourceNode.getOutputId(outputPosition))
        return this.loop(...outputIds)
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