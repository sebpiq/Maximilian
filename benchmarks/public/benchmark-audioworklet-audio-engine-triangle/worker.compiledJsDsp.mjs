import { BenchmarkProcessor } from '/common/mjs/benchmarking-audioworklet.mjs'
import { ConstantNode, TriangleNode, BufferNode, render } from '/common/mjs/dsp-engine-eval-js.mjs'

const FREQUENCY = 40

class CompiledJsNode extends BenchmarkProcessor {
    
    constructor(options) {
        super(options)
        const constantNode = new ConstantNode(FREQUENCY)
        const triNode = new TriangleNode()
        const bufferNode = this.bufferNode = new BufferNode(this.config.blockSize)
    
        const dspGraph = [
            [triNode, [constantNode, 0]],
            [bufferNode, [triNode, 0]]
        ]
    
        const dspLoopString = render(dspGraph, this.config)
        // console.log('COMPILED JS', dspLoopString)
        this.dspLoop = new Function(dspLoopString)
    }

    _loop({ blockSize }, { output }) {
        this.bufferNode.setState('buffer', output)
        this.dspLoop()
    }
}

registerProcessor("benchmark-processor", CompiledJsNode)