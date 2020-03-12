import { createGraph, plotSignal, plotLegend } from './graphs.mjs'

const COLORS = ['red', 'green', 'blue', 'black', 'purple', 'orange']

const PROGRESS = {
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

const displayResults = (runnerConfig, benchmarkResults) => {
    const baselineFunctionName = _.last(runnerConfig.benchmarkWorkers)
    const x = runnerConfig.blockSizes

    // Build series by collecting results and grouping them by function name
    const seriesMeans = {}
    benchmarkResults.forEach((benchmarkResult) => {
        benchmarkResult.forEach(({functionName, meanDuration}) => {
            seriesMeans[functionName] = seriesMeans[functionName] || []
            seriesMeans[functionName].push(meanDuration)
        })
    })

    const baselineSamples = seriesMeans[baselineFunctionName]

    // Turn run times into comparison ratios with the baseline
    const seriesRatio = _.mapValues(seriesMeans, 
        samples => 
            samples.map((value, i) => baselineSamples[i] / value)
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

    // Plot all series on the graph to compare with baseline
    _.toPairs(seriesRatio).forEach(([seriesName, samples]) => {
        const color = COLORS.shift()
        plotSignal(graph, samples, {stroke: color})
        plotLegend(graph, seriesName, color)
    })

    // Take only one benchmark result, and for each function plot an preview of the signal, just for sanity check. 
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

const runFunctionInAudioWorklet = async (workerUrl, runParams) => {
    class BenchmarkNode extends AudioWorkletNode {  
        constructor (audioContext, runParams, resolve, reject) {
            super(audioContext, 'benchmark-processor', {      
                numberOfInputs: 1,
                numberOfOutputs: 1,
                channelCount: 1,
                processorOptions: runParams,
            })
            this.port.onmessage = event => {
                this.disconnect()
                audioContext.close()
                resolve(event.data)
            }
            this.onprocessorerror = reject
            this.port.start()
        }
    }

    const audioContext = new AudioContext()
    await audioContext.audioWorklet.addModule(workerUrl)
    
    return new Promise((resolve, reject) => {
        const benchmarkNode = new BenchmarkNode(audioContext, {
            sampleRate: 44100,
            previewSampleSize: 44100 / 40 * 3,
            name: workerUrl,
            ...runParams
        }, resolve, reject)
        audioContext.resume()
        // To start processing
        benchmarkNode.connect(audioContext.destination)
    })
}

const runFunctionInWorker = (workerUrl, runParams) => {
    let workerOpts = {}
    if (workerUrl.endsWith('.mjs')) {
        workerOpts = { type: 'module' }
    }
    const benchmarkWorker = new Worker(workerUrl, workerOpts)
    benchmarkWorker.postMessage({
        sampleRate: 44100,
        previewSampleSize: 44100 / 40 * 3,
        name: workerUrl,
        ...runParams
    })

    return new Promise((resolve) => {
        benchmarkWorker.onmessage = (message) => {
            benchmarkWorker.terminate()
            resolve(message.data)
        }
    })
}

const runBenchmark = async (runnerConfig, runParams) => {
    const results = []
    const runFunction = {
        'worker': runFunctionInWorker,
        'audioworklet': runFunctionInAudioWorklet
    }[runnerConfig.mode]
    for (let workerUrl of runnerConfig.benchmarkWorkers) {
        results.push(await runFunction(workerUrl, runParams))
        updateProgress()
    }
    return results
}

export default async (runnerConfig) => {
    initializeProgress(runnerConfig.blockSizes.length * runnerConfig.benchmarkWorkers.length)

    const benchmarkResults = []
    for (let blockSize of runnerConfig.blockSizes) {
        benchmarkResults.push(await runBenchmark(runnerConfig, { 
            blockSize, 
            functionIterations: runnerConfig.totalOperationsPerRun / blockSize 
        }))
    }

    console.log(benchmarkResults)
    displayResults(runnerConfig, benchmarkResults)
}