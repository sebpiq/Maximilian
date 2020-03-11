importScripts('/assemblyscript/build/assemblyscript.js')

const FREQUENCY = 40


class ConstantNode extends NodeTemplate {

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


class TriangleNode extends NodeTemplate {

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


class BufferNode extends NodeTemplate {

    constructor(bufferSize) {
        super()
        this._createState('buffer')
        this.bufferSize = bufferSize
    }

    setup() {
        return `const ${this.getStateId('buffer')} = new Float32Array(${this.bufferSize});`
    }

    loop(input) {
        return `${this.getStateId('buffer')}[BLOCK_FRAME_INDEX] = ${input};`
    }
}

function dspLoop({ computeIterations }, { dspModule }) {
    dspModule.loop()
}

onmessage = (message) => {
    const config = message.data
    const constantNode = new ConstantNode(FREQUENCY)
    const triNode = new TriangleNode()
    const bufferNode = new BufferNode(config.computeIterations)

    // [node, [nodeInput1, ...]]
    const nodeLoops = [
        triNode.renderLoop([constantNode, 0]),
        bufferNode.renderLoop([triNode, 0])
    ]

    const nodeSetup = [
        constantNode.setup(),
        triNode.setup(),
        bufferNode.setup()
    ]
    
    const dspLoopString = `
        let BLOCK_FRAME_INDEX = 0;
        const SAMPLE_RATE: f32 = ${config.sampleRate};
        const BLOCK_SIZE = ${config.computeIterations};
        
        ${nodeSetup.join('\n')}

        export function getBufferPointer(): Float32Array {
            return ${bufferNode.getStateId('buffer')};
        }

        export function loop(): void {
            for (BLOCK_FRAME_INDEX = 0; BLOCK_FRAME_INDEX < BLOCK_SIZE; BLOCK_FRAME_INDEX++) {
                ${nodeLoops.join('\n')}
            }
        }
    `

    // console.log(dspLoopString)

    // Module loaded uses : https://docs.assemblyscript.org/basics/loader
    initializeAsc().then(() => {
        const startDate = self.performance.now()
        const promise = loadAsc(dspLoopString)
        console.log(`compile time : ${(self.performance.now() - startDate)} ms`)
        return promise

    }).then((dspModule) => {
        const output = dspModule.__getFloat32ArrayView(dspModule.getBufferPointer())
        const results = runFunction(dspLoop, config, { output, dspModule })
        postMessage(results)
    })
}