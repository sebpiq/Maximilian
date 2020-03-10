import { createGraph, plotSignal, plotLegend } from './common/graphs.js'

const TOTAL_OPERATIONS_PER_RUN = 50000000
const COMPUTE_ITERATIONS = [256, 512, 1024, 2048, 4096, 8192, 16384, 32768, 65536, 131072, 200000]
// const COMPUTE_ITERATIONS = [256, 2048, 32768, 50000, 200000]
const COLORS = ['red', 'green', 'blue', 'black', 'purple', 'orange']
const BENCHMARK_WORKERS = [
    // 'worker.wasmTriangle.js', 
    'worker.myDspTriangleVector.js',
    // 'worker.wasmTriangleVector.js',
    // 'worker.myDspTriangleVectorBaseline.js',
    // 'worker.maxiWasmTriangle.js', 
    // 'poc-history/2/worker.triangle.js',
    // 'poc-history/3/worker.triangle.js',
    // 'poc-history/4/worker.triangle.js',
    'poc-history/1/worker.triangle.js',
    'worker.pureJsDsp.js',
]
const BASELINE_FUNCTION = _.last(BENCHMARK_WORKERS)

let PROGRESS = {
    final: 0,
    current: 0
}
const initializeProgress = (count) => {
    PROGRESS.final = count
    PROGRESS.current = 0
    displayProgress()
}

const updateProgress = () => {
    PROGRESS.current++
    displayProgress()
}

const displayProgress = () => {
    document.querySelector('#progress').innerHTML = `PROGRESS : ${PROGRESS.current} / ${PROGRESS.final}`
}

const displayResults = (runConfigs, benchmarkResults) => {
    const x = _.map(runConfigs, 'computeIterations')
    const seriesMeans = {}
    benchmarkResults.forEach((benchmarkResult) => {
        benchmarkResult.forEach(({functionName, meanDuration}) => {
            seriesMeans[functionName] = seriesMeans[functionName] || []
            seriesMeans[functionName].push(meanDuration)
        })
    })
    const referenceSamples = seriesMeans[BASELINE_FUNCTION]
    const seriesRatio = _.mapValues(seriesMeans, 
        samples => 
            samples.map((value, i) => referenceSamples[i] / value)
    )

    const graph = createGraph(document.querySelector('#mainPlot'), {
        size: 500, 
        xValues: x, 
        xScale: d3.scaleLog(),
        yScale: d3.scaleLog().domain([
            _.min(_.flatten(_.values(seriesRatio))),
            _.max(_.flatten(_.values(seriesRatio)))
        ])
    })

    _.toPairs(seriesRatio).forEach(([seriesName, samples]) => {
        const color = COLORS.shift()
        plotSignal(graph, samples, {stroke: color})
        plotLegend(graph, seriesName, color)
    })

    _.last(benchmarkResults).forEach(({functionName, preview}) => {
        const previewGraph = createGraph(document.querySelector('#previews'), {
            size: 100,
            xValues: _.range(preview.length), 
            xScale: d3.scaleLinear(),
            yScale: d3.scaleLinear().domain([-1, 1])
        })
        plotSignal(previewGraph, preview, {stroke: 'green'})
        plotLegend(previewGraph, functionName, 'green')
    })

} 

const runFunction = (workerUrl, config) => {
    const benchmarkWorker = new Worker(workerUrl, { type: 'module' })

    benchmarkWorker.postMessage({
        sampleRate: 44100,
        previewSampleSize: 44100 / 40 * 3,
        name: workerUrl,
        ...config
    })

    return new Promise((resolve) => {
        benchmarkWorker.onmessage = (message) => {
            benchmarkWorker.terminate()
            resolve(message.data)
        }
    })
}

const runBenchmark = async (config) => {
    const results = []
    for (let workerUrl of BENCHMARK_WORKERS) {
        results.push(await runFunction(workerUrl, config))
        updateProgress()
    }
    return results
}

const main = async () => {
    const runConfigs = (COMPUTE_ITERATIONS)
        .map(computeIterations => ({ 
            computeIterations, 
            functionIterations: TOTAL_OPERATIONS_PER_RUN / computeIterations 
        }))
    initializeProgress(COMPUTE_ITERATIONS.length * BENCHMARK_WORKERS.length)
    const benchmarkResults = []
    for (let runConfig of runConfigs) {
        benchmarkResults.push(await runBenchmark(runConfig))
    }
    console.log(benchmarkResults)
    displayResults(runConfigs, benchmarkResults)
}

main().then(() => {
    console.log('ALL DONE!!!')
})