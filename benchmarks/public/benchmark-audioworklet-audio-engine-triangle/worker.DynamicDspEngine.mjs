import { BenchmarkProcessor } from '/common/mjs/benchmarking-audioworklet.mjs'
import { getFloat32Array } from '/common/mjs/wasm-utils.mjs'
import DynamicDspEngine from '/common/wasm/dynamic-dsp-engine/DynamicDspEngine.mjs'

class DynamicDspEngineNode extends BenchmarkProcessor {
    
    constructor(options) {
        super(options)

        const dspModule = this.dspModule = DynamicDspEngine()
        dspModule._initialize(20, this.config.blockSize)

        const nodeConstant = this.nodeConstant = dspModule._wnode_create(0)
        const nodeTriangle = dspModule._wnode_create(3)
        const nodeBuffer = this.nodeBuffer = dspModule._wnode_create(4)
        dspModule._wnode_ports_connect(nodeConstant, 0, nodeTriangle, 0)    
        dspModule._wnode_ports_connect(nodeTriangle, 0, nodeBuffer, 0)

        dspModule._wgraph_compile(nodeConstant)
        this.output = getFloat32Array(dspModule, dspModule._wnode_state_get_pointer(nodeBuffer), this.config.blockSize)
    }

    _loop({ blockSize }, { output }) {
        this.dspModule._dsp_block(this.nodeConstant, this.nodeBuffer)
        output.set(this.output)
    }
}

registerProcessor("benchmark-processor", DynamicDspEngineNode)