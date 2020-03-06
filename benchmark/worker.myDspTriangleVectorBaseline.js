import { runFunction } from './common/benchmark.js'
import MyDsp from './wasm/my-dsp-baseline/MyDsp.mjs'

function myDspTriangleVector({ computeIterations }, context) {
    const outBlockPointer = context.myDspModule._dsp_block(context.root, context.leaf)
    const start = (outBlockPointer>>2)
    context.output = context.myDspModule.HEAPF32.subarray(start, start + computeIterations)
}

onmessage = (message) => {
    const config = message.data
    const myDspModule = MyDsp()
    myDspModule.then(() => {
        myDspModule._initialize(2, config.computeIterations)
        const nodeConstant = myDspModule._wnode_create(0)
        const nodeTriangle = myDspModule._wnode_create(3)
        myDspModule._wnode_ports_connect(nodeConstant, 0, nodeTriangle, 0)    
        postMessage(
            runFunction(myDspTriangleVector, config, { 
                myDspModule,
                root: nodeConstant, leaf: nodeTriangle,
                output: null,
            })
        )
    })
}