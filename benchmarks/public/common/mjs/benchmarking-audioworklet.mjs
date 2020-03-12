import { runFunctionIterator } from '/common/mjs/benchmarking-utils.mjs'

const QUANTUM_SIZE = 128

export class BenchmarkProcessor extends AudioWorkletProcessor {
    
    constructor(options) {
        super(options)
        this.config = options.processorOptions
        this.iterator = runFunctionIterator(this._loop.bind(this), this.config)
    }

    process(inputs, outputs, parameters) {
        const output = new Float32Array(this.config.blockSize)
        const results = this.iterator.next({ output })
        if (results.value) {
            this.port.postMessage(results.value)
            return false
        }
        return true
    }

    _loop(output) {
        throw new Error('IMPLEMENT ME!!!')
    }
}