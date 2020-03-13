import * as ___ from '../assemblyscript-utils/loader.mjs'
import { getMeanDurationSeconds } from './maths.mjs'

// `performance` is not available in AudioWorklet, which makes
// benchmarking not accurate
let TIMING = globalThis.performance || globalThis.Date

class LoopRunner {

    constructor(config, loopBuilder) {
        this.timesInMs = []
        this.preview = null
        this.config = config
        this.loopBuilder = loopBuilder
    }

    runLoop(context) {
        let startDate, endDate
        const loop = this.loopBuilder(context)
        startDate = TIMING.now()
        loop()
        endDate = TIMING.now()
        if (!this.preview) {
            this.preview = context.output.slice(0, this.config.previewSampleSize)
        }
        this.timesInMs.push(endDate - startDate)
    }

    compileResults() {
        let meanDuration = getMeanDurationSeconds(this.timesInMs)
        if (!meanDuration) {
            console.error('time to small to be measured')
            meanDuration = 0.000000001
        }
        return { 
            preview: this.preview, 
            meanDuration, 
            functionName: this.config.name 
        }
    }

    hasEnoughData() {
        return this.timesInMs.length >= this.config.functionIterations
    }

}

class MainThreadCommunication {
    
    constructor(messagePort) {
        this.messagePort = messagePort
        this._startPromiseResolve = null
        this.startPromise = new Promise(resolve => this._startPromiseResolve = resolve)
        this._assemblyScriptCompileResolve = null
        messagePort.onmessage = this.receive.bind(this)
    }

    receive(message) {
        console.log('WORKER THREAD, message', message.data.operation)

        if (message.data.operation === 'benchmark-start') {
            this._startPromiseResolve(message.data.payload)
        
        } else if (message.data.operation === 'assemblyscript-compiled') {
            this._assemblyScriptCompileResolve(loadAsc(message.data.payload))
        }
    }

    complete(results) {
        this.messagePort.postMessage({ operation: 'benchmark-complete', payload: results })
    }

    assemblyScriptLoad(sourceCode) {
        this.messagePort.postMessage({ operation: 'assemblyscript-compile', payload: sourceCode })
        return new Promise(resolve => this._assemblyScriptCompileResolve = resolve)
    }
}

export const runFromWorker = (loopBuilderBuilder) => {
    let config
    const mainThreadCommunication = new MainThreadCommunication(globalThis)

    mainThreadCommunication.startPromise
        .then((_config) => {
            config = _config
            return loopBuilderBuilder(config, mainThreadCommunication)
        })
        .then((loopBuilder) => {
            const loopRunner = new LoopRunner(config, loopBuilder)
            console.log(`START FUNCTION ${config.name}`)
            while (!loopRunner.hasEnoughData()) {
                const context = { output: new Float32Array(config.blockSize) }
                loopRunner.runLoop(context)
            }
            const results = loopRunner.compileResults()
            console.log(`END FUNCTION ${config.name}, time : ${results.meanDuration}`)
            mainThreadCommunication.complete(results)
        })

}

export const runFromAudioWorklet = (loopBuilderBuilder) => {

    class BenchmarkProcessor extends AudioWorkletProcessor {
    
        constructor(options) {
            super(options)
            this.mainThreadCommunication = new MainThreadCommunication(this.port)
            this.mainThreadCommunication.startPromise
                .then((config) => {
                    this.config = config
                    return loopBuilderBuilder(this.config, this.mainThreadCommunication)
                })
                .then((loopBuilder) => {
                    this.loopRunner = new LoopRunner(this.config, loopBuilder)
                    console.log(`START FUNCTION ${this.config.name}`)
                })
        }
    
        process(inputs, outputs, parameters) {
            if (!this.loopRunner) {
                return true
            }

            const context = { output: new Float32Array(this.config.blockSize) }
            this.loopRunner.runLoop(context)
            if (this.loopRunner.hasEnoughData()) {
                const results = this.loopRunner.compileResults()
                console.log(`END FUNCTION ${this.config.name}, time : ${results.meanDuration}`)
                this.mainThreadCommunication.complete(results)
                return false
            }
            return true
        }
    }
    
    registerProcessor("benchmark-processor", BenchmarkProcessor)
}