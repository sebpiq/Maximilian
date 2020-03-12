import { getMeanDurationSeconds } from './maths.mjs'

export function* runFunctionIterator (func, config) {
    let timing = Date
    if (typeof self !== 'undefined') {
        timing = self.performance
    }

    console.log(`START FUNCTION ${config.name}`)
    
    let i = 0
    const timesInMs = []
    let preview = null
    let startDate, endDate
    for (i; i < config.functionIterations; i++) {
        const context = yield null
        startDate = timing.now()
        func(config, context)
        endDate = timing.now()
        if (i === 0) {
            preview = context.output.slice(0, config.previewSampleSize)
        }
        timesInMs.push(endDate - startDate)
    }
    
    let meanDuration = getMeanDurationSeconds(timesInMs)
    if (!meanDuration) {
        console.error('time to small to be measured')
        meanDuration = 0.000000001
    }
    console.log(`END FUNCTION ${config.name}, time : ${meanDuration}`)
    yield {preview, meanDuration, functionName: config.name}
}

export const runFunction = (func, config, context) => {
    const it = runFunctionIterator(func, config, context)
    let results = null
    while (!results) {
        results = it.next(context).value
    }
    return results
}