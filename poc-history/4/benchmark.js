const MyDsp = require('./build/MyDsp.js')
const MyDspBaseline1 = require('./poc-history/1/build/MyDsp.js')
const myDsp = MyDsp()
const myDspBaseline1 = MyDspBaseline1()

const NS_PER_SEC = 1e9;
const BLOCK_SIZE = 50000000
const ITERATIONS = 15

const hrtimeToNumber = (hrtime) => {
    return (hrtime[0] * NS_PER_SEC + hrtime[1]) / 1e6
}

const runBenchmark = (dspModule) => {
    const times = []
    dspModule._initialize(10, BLOCK_SIZE)

    const node_constant = dspModule._wnode_create(0) // 4
    const node_triangle = dspModule._wnode_create(3) // triangle

    dspModule._wnode_ports_connect(node_constant, 0, node_triangle, 0)
    if (dspModule._wgraph_compile) {
        dspModule._wgraph_compile(node_constant)
    }

    for (let i = 0; i < ITERATIONS; i++) {
        console.time('DSP')
        const startDate = process.hrtime();
        dspModule._dsp_block(node_constant, node_triangle)
        const diff = process.hrtime(startDate);
        console.timeEnd('DSP')
        times.push(hrtimeToNumber(diff))
    }

    // remove first times cause they often seem skewed
    return [times, times.slice(4).reduce((a, b) => a + b, 0) / times.length]
}

const main = async () => {
    let times, meanTime
    ;[times, meanTime] = runBenchmark(myDsp)
    console.log(`MEAN TIME ${meanTime}`)

    console.log('------ BASELINE 1 -------')

    ;[times, meanTime] = runBenchmark(myDspBaseline1)
    console.log(`MEAN TIME ${meanTime}`)
}

main().then(() => {
    console.log('DONE')
})