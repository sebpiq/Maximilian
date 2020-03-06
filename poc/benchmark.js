const assert = require('assert')
const MyDsp = require('./build/MyDsp.js')
const MyDspBaseline = require('./build-baseline/MyDsp.js')
const myDsp = MyDsp()
const myDspBaseline = MyDspBaseline()

const BLOCK_SIZE = 2000000
const ITERATIONS = 10

const runBenchmark = (dspModule) => {
    dspModule._initialize(10, BLOCK_SIZE)

    const node_1 = dspModule._wnode_create(0) // 4
    const node_triangle = dspModule._wnode_create(3) // triangle

    dspModule._wnode_ports_connect(node_1, 0, node_triangle, 0)
    
    for (let i = 0; i < ITERATIONS; i++) {
        console.time('DSP')
        dspModule._dsp_block(node_1, node_triangle)
        console.timeEnd('DSP')
    }
}

const main = async () => {
    runBenchmark(myDsp)

    console.log('------ BASELINE -------')

    runBenchmark(myDspBaseline)
}

main().then(() => {
    console.log('DONE')
})