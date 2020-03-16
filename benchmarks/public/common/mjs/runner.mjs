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
    const graphConfig = _.defaults(runnerConfig.graph || {}, {
        baselineComparison: (baselineValue, value) => baselineValue / value,
        plotBaseline: true,
    })
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
            samples.map((value, i) => graphConfig.baselineComparison(baselineSamples[i], value, i))
    )

    if (!graphConfig.plotBaseline) {
        delete seriesRatio[baselineFunctionName]
    }

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

class RunnerCommunication {
    
    constructor(messagePort) {
        this.messagePort = messagePort
        this._assemblyScriptCompilerWorker = null
        this._completePromiseResolve = null
        this.completePromise = new Promise((resolve) => this._completePromiseResolve = resolve)
        messagePort.onmessage = this.receive.bind(this)
    }

    receive(message) {
        console.log('MAIN THREAD, message', message.data.operation)
        if (message.data.operation === 'benchmark-complete') {
            this._completePromiseResolve(message.data.payload)
        
        } else if (message.data.operation === 'assemblyscript-compile') {
            this._assemblyScriptCompilerWorker = new Worker('/common/assemblyscript-utils/assemblyscript-compile-worker.js')
            this._assemblyScriptCompilerWorker.postMessage(message.data.payload)
            this._assemblyScriptCompilerWorker.onmessage = (compiledMessage) => {
                this._assemblyScriptCompilerWorker.terminate()
                this._assemblyScriptCompilerWorker = null
                this.messagePort.postMessage({
                    operation: 'assemblyscript-compiled',
                    payload: compiledMessage.data,
                })
            }
        }
    }

    start(config) {
        this.messagePort.postMessage({
            operation: 'benchmark-start',
            payload: {
                sampleRate: 44100,
                previewSampleSize: 44100 / 40 * 3,
                ...config
            }
        })
    }
}

const runFunctionInWorker = (workerUrl, runParams) => {
    let workerOpts = {}
    if (workerUrl.endsWith('.mjs')) {
        workerOpts = { type: 'module' }
    }
    
    const benchmarkWorker = new Worker(workerUrl, workerOpts)

    const runnerCommunication = new RunnerCommunication(benchmarkWorker)
    runnerCommunication.start({ name: workerUrl, ...runParams })
    return runnerCommunication.completePromise.then((results) => {
        benchmarkWorker.terminate()
        return results
    })
}

const runFunctionInAudioWorklet = async (workerUrl, runParams) => {

    class BenchmarkNode extends AudioWorkletNode {  
        constructor (audioContext, resolve, reject) {
            super(audioContext, 'benchmark-processor', {      
                numberOfInputs: 1,
                numberOfOutputs: 1,
                channelCount: 1,
            })

            const runnerCommunication = new RunnerCommunication(this.port)
            runnerCommunication.start({ name: workerUrl, ...runParams })
            runnerCommunication.completePromise.then((results) => {
                this.disconnect()
                audioContext.close()
                resolve(results)
            })

            this.onprocessorerror = reject
            this.port.start()
        }
    }

    const audioContext = new AudioContext()
    await audioContext.audioWorklet.addModule(workerUrl)
    
    return new Promise((resolve, reject) => {
        const benchmarkNode = new BenchmarkNode(audioContext, resolve, reject)
        audioContext.resume()
        // To start processing
        benchmarkNode.connect(audioContext.destination)
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