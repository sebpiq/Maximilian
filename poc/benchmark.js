const MyDsp = require('./build/MyDsp.js')
const MyDspBaseline = require('./build-baseline/MyDsp.js')
const myDsp = MyDsp()
const myDspBaseline = MyDspBaseline()

const BLOCK_SIZE = 10000000
const ITERATIONS = 10

const runBenchmark = (dspModule) => {
    dspModule._initialize(10, BLOCK_SIZE)

    const node_constant = dspModule._wnode_create(0) // 4
    const node_triangle = dspModule._wnode_create(3) // triangle

    dspModule._wnode_ports_connect(node_constant, 0, node_triangle, 0)
    if (dspModule._wgraph_compile) {
        dspModule._wgraph_compile(node_constant)
    }

    for (let i = 0; i < ITERATIONS; i++) {
        console.time('DSP')
        dspModule._dsp_block(node_constant, node_triangle)
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