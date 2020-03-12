const QUANTUM_SIZE = 128

class BenchmarkProcessor extends AudioWorkletProcessor {
    
    constructor(options) {
        super(options)
        this.echo = options.processorOptions.echo
    }

    process(inputs, outputs, parameters) {  
        for (let i = 0; i < QUANTUM_SIZE; ++i) {
        }
        console.log('PROCESS')
        this.port.postMessage({
            done: this.echo
        })
        return false
    }
}

registerProcessor("benchmark-processor", BenchmarkProcessor);