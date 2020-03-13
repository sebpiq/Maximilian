import { getFloat32Array } from '/common/mjs/wasm-utils.mjs'
import DynamicDspEngine from '/common/wasm/dynamic-dsp-engine/DynamicDspEngine.mjs'

export const benchmark__SimpleTriangleDspGraph = (config) => {
    const dspModule = DynamicDspEngine()
    dspModule._initialize(20, config.blockSize)
    const nodeConstant = dspModule._wnode_create(0)
    const nodeTriangle = dspModule._wnode_create(3)
    const nodeBuffer = dspModule._wnode_create(4)
    dspModule._wnode_ports_connect(nodeConstant, 0, nodeTriangle, 0)    
    dspModule._wnode_ports_connect(nodeTriangle, 0, nodeBuffer, 0)

    dspModule._wgraph_compile(nodeConstant)
    const output = getFloat32Array(dspModule, dspModule._wnode_state_get_pointer(nodeBuffer), config.blockSize)
    return (context) => {
        return () => {
            dspModule._dsp_block(nodeConstant)
            context.output.set(output)
        }
    }
}