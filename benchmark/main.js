import { createGraph, plotSignal, plotLegend } from './common/graphs.js'

const TOTAL_OPERATIONS_PER_RUN = 100000000
const COMPUTE_ITERATIONS = [8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384, 32768, 65536, 131072]
const COLORS = ['red', 'green', 'blue', 'brown', 'yellow', 'orange']

const displayResults = (runConfigs, benchmarkResults) => {
    const x = _.map(runConfigs, 'computeIterations')
    const seriesMeans = {}
    benchmarkResults.forEach((benchmarkResult) => {
        benchmarkResult.forEach(({functionName, meanDuration}) => {
            seriesMeans[functionName] = seriesMeans[functionName] || []
            seriesMeans[functionName].push(meanDuration)
        })
    })
    const referenceSamples = seriesMeans.pureJsTriangle
    const seriesRatio = _.mapValues(seriesMeans, 
        samples => 
            samples.map((value, i) => value ? referenceSamples[i] / value: 0.00000001) // to avoid division by zero and log error
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

const runBenchmark = (config) => {
    const benchmarkWorker = new Worker('./benchmark.worker.js', { type: 'module' })

    benchmarkWorker.postMessage({
        operation: 'run',
        payload: {
            sampleRate: 44100,
            previewSampleSize: 44100 / 40 * 3,
            ...config
        }
    })

    return new Promise((resolve) => {
        benchmarkWorker.onmessage = (message) => {
            benchmarkWorker.terminate()
            resolve(message.data.results)
        }
    })
}

const main = async () => {
    const runConfigs = (COMPUTE_ITERATIONS)
        .map(computeIterations => ({ 
            computeIterations, 
            functionIterations: TOTAL_OPERATIONS_PER_RUN / computeIterations 
        }))
    const benchmarkResults = []
    for (let runConfig of runConfigs) {
        benchmarkResults.push(await runBenchmark(runConfig))
    }
    displayResults(runConfigs, benchmarkResults)
}

main().then(() => {
    console.log('ALL DONE!!!')
})