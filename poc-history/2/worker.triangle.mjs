import { runFunction } from '/common/benchmark.js'
import MyDsp from './build/MyDsp.mjs'

function myDspTriangleVector({ blockSize }, context) {
    context.myDspModule._dsp_block(context.root, context.leaf)
}

onmessage = (message) => {
    const config = message.data
    const myDspModule = MyDsp()
    myDspModule.then(() => {
        myDspModule._initialize(20, config.blockSize)
        const nodeConstant = myDspModule._wnode_create(0)
        const nodeTriangle = myDspModule._wnode_create(3)
        const nodeBuffer = myDspModule._wnode_create(4)
        myDspModule._wnode_ports_connect(nodeConstant, nodeTriangle)    
        myDspModule._wnode_ports_connect(nodeTriangle, nodeBuffer)

        myDspModule._wgraph_compile(nodeConstant)
        const outBlockPointer = myDspModule._wnode_state_get_pointer(nodeBuffer)
        const outBlockStartIndex = (outBlockPointer>>2)
        postMessage(
            runFunction(myDspTriangleVector, config, { 
                myDspModule,
                root: nodeConstant, leaf: nodeBuffer,
                output: myDspModule.HEAPF32.subarray(outBlockStartIndex, outBlockStartIndex + config.blockSize),
            })
        )
    })
}