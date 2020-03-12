import { BenchmarkProcessor } from '/common/mjs/benchmarking-audioworklet.mjs'
import { ConstantNode, TriangleNode, BufferNode, run, setSettings } from '/common/mjs/dsp-engine-pure-js.mjs'

const FREQUENCY = 40

class PureJsDspNode extends BenchmarkProcessor {
    
    constructor(options) {
        super(options)
        setSettings({ sampleRate: this.config.sampleRate })
        const constantNode = new ConstantNode(FREQUENCY)
        const triNode = new TriangleNode()
        const bufferNode = this.bufferNode = new BufferNode()
        this.dspGraph = [
            [constantNode, []],
            [triNode, [constantNode]],
            [bufferNode, [triNode]]
        ]
    }

    _loop({ blockSize }, { output }) {
        this.bufferNode.buffer = output
        run(blockSize, this.dspGraph)
    }
}

registerProcessor("benchmark-processor", PureJsDspNode)