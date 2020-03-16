import { NodeTemplate } from './dsp-engine-eval-templates.mjs'

export class ConstantNode extends NodeTemplate {

    constructor(value) {
        super()
        this.value = value
        this._createOutputs(1)
    }

    setup() {
        return `let ${this.getOutputId(0)}: f32 = ${this.value};`
    }

    loop() {
        return ``
    }
}


export class TriangleNode extends NodeTemplate {

    constructor() {
        super()
        this._createOutputs(1)
        this._createState('phase')
    }

    setup() {
        return `
let ${this.getOutputId(0)}: f32 = 0.0;
let ${this.getStateId('phase')}: f32 = 0.0;
        `
    }

    loop(frequency) {
        const phase = this.getStateId('phase')
        const output = this.getOutputId(0)
        return `
    if ( ${phase} >= 1.0 ) {
        ${phase} -= 1.0;
    }
    ${phase} += 1.0 / (SAMPLE_RATE/${frequency});
    if (${phase} <= 0.5 ) {
        ${output} = (${phase} - 0.25) * 4.0;
    } else {
        ${output} = ((1.0 - ${phase}) - 0.25) * 4.0;
    }
        `
    }
}


export class BufferNode extends NodeTemplate {

    constructor(bufferSize) {
        super()
        this._createState('buffer')
        this._createState('getBufferPointer')
        this.bufferSize = bufferSize
    }

    setup() {
        return `
const ${this.getStateId('buffer')} = new Float32Array(${this.bufferSize});

export function ${this.getStateId('getBufferPointer')}(): Float32Array {
    return ${this.getStateId('buffer')};
}

`
    }

    loop(input) {
        return `
    ${this.getStateId('buffer')}[BLOCK_FRAME_INDEX] = ${input};
`
    }
}

// dspGraph format :
// [
//    [node1, [[nodeInput1A, output1A], ...]]
//    [node2, [[nodeInput2A, output2A], ...]]
// ]
export const render = (dspGraph, config) => {
    const renderedSetups = dspGraph.map(([node, inputs]) => node.setup())
    const renderedLoops = dspGraph.map(([node, inputs]) => node.renderLoop(...inputs))

    return `
let BLOCK_FRAME_INDEX = 0;
const SAMPLE_RATE: f32 = ${config.sampleRate};
const BLOCK_SIZE = ${config.blockSize};

${renderedSetups.join('\n')}

export function loop(): void {
    for (BLOCK_FRAME_INDEX = 0; BLOCK_FRAME_INDEX < BLOCK_SIZE; BLOCK_FRAME_INDEX++) {
        ${renderedLoops.join('\n')}
    }
}
`
}

export const benchmark__SimpleTriangleDspGraph = (config, mainThreadCommunication) => {
    const frequency = 40
    const constantNode = new ConstantNode(frequency)
    const triNode = new TriangleNode()
    const bufferNode = new BufferNode(config.blockSize)
    const dspGraph = [
        [constantNode, []],
        [triNode, [[constantNode, 0]]],
        [bufferNode, [[triNode, 0]]]
    ]

    const dspLoopString = render(dspGraph, config)
    // console.log(dspLoopString)

    return mainThreadCommunication.assemblyScriptLoad(dspLoopString)
        .then((dspModule) => {
            const output = dspModule.__getFloat32ArrayView(dspModule[bufferNode.getStateId('getBufferPointer')]())
            return (context) => {
                function loopTriangleAssemblyScript() {
                    dspModule.loop()
                }

                loopTriangleAssemblyScript.after = () => {
                    context.output.set(output)
                }

                return loopTriangleAssemblyScript
            }
        })
}