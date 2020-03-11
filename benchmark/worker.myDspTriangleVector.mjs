import { runFunction } from './common/benchmark.mjs'
import MyDsp from './wasm/my-dsp/MyDsp.mjs'

function myDspTriangleVector({ computeIterations }, context) {
    context.myDspModule._dsp_block(context.root, context.leaf)
}

onmessage = (message) => {
    const config = message.data
    const myDspModule = MyDsp()
    myDspModule.then(() => {
        myDspModule._initialize(20, config.computeIterations)
        const nodeConstant = myDspModule._wnode_create(0)
        const nodeTriangle = myDspModule._wnode_create(3)
        const nodeBuffer = myDspModule._wnode_create(4)
        myDspModule._wnode_ports_connect(nodeConstant, 0, nodeTriangle, 0)    
        myDspModule._wnode_ports_connect(nodeTriangle, 0, nodeBuffer, 0)

        myDspModule._wgraph_compile(nodeConstant)
        const outBlockPointer = myDspModule._wnode_state_get_pointer(nodeBuffer)
        const outBlockStartIndex = (outBlockPointer>>2)
        postMessage(
            runFunction(myDspTriangleVector, config, { 
                myDspModule,
                root: nodeConstant, leaf: nodeBuffer,
                output: myDspModule.HEAPF32.subarray(outBlockStartIndex, outBlockStartIndex + config.computeIterations),
            })
        )
    })
}