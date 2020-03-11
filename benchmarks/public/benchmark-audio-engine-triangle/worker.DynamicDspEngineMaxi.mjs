import { getFloat32Array } from '/common/mjs/wasm-utils.mjs'
import { runFunction } from '/common/mjs/benchmarking.mjs'
import DynamicDspEngineMaxi from '/common/wasm/dynamic-dsp-engine-maxi/DynamicDspEngineMaxi.mjs'

function myDspTriangleVector({ blockSize }, context) {
    context.dspModule._dsp_block(context.root, context.leaf)
}

onmessage = (message) => {
    const config = message.data
    const dspModule = DynamicDspEngineMaxi()
    dspModule.then(() => {
        dspModule._initialize(20, config.blockSize)
        const nodeConstant = dspModule._wnode_create(0)
        const nodeTriangle = dspModule._wnode_create(3)
        const nodeBuffer = dspModule._wnode_create(4)
        dspModule._wnode_ports_connect(nodeConstant, 0, nodeTriangle, 0)    
        dspModule._wnode_ports_connect(nodeTriangle, 0, nodeBuffer, 0)

        dspModule._wgraph_compile(nodeConstant)
        const output = getFloat32Array(dspModule, dspModule._wnode_state_get_pointer(nodeBuffer), config.blockSize)
        postMessage(
            runFunction(myDspTriangleVector, config, { 
                dspModule, output,
                root: nodeConstant, leaf: nodeBuffer,
            })
        )
    })
}