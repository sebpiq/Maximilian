import { getMeanDurationSeconds } from './maths.js'

const runFunction = (config, func, context) => {
    const functionName = func.name
    console.log(`START FUNCTION ${functionName}`)
    
    let i = 0
    const timesInMs = []
    let preview = null
    for (i; i < config.functionIterations; i++) {
        const startDate = Date.now()
        func(config, context)
        const endDate = Date.now()
        const output = context.output
        if (i === 0) {
            preview = output.slice(0, config.previewSampleSize)
        }
        timesInMs.push(endDate - startDate)
    }
    
    const meanDuration = getMeanDurationSeconds(timesInMs)
    console.log(`END FUNCTION ${functionName}, time : ${meanDuration}`)
    return {preview, meanDuration, functionName}
}

export const runBenchmark = (config, ...functions) => {
    console.log('RUN benchmark', functions)
    return functions.map(([func, context]) => runFunction(config, func, context))
}