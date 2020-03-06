import { getMeanDurationSeconds } from './maths.js'

export const runFunction = (func, config, context) => {
    const functionName = config.name || func.name
    console.log(`START FUNCTION ${functionName}`)
    
    let i = 0
    const timesInMs = []
    let preview = null
    let startDate, endDate
    for (i; i < config.functionIterations; i++) {
        startDate = self.performance.now()
        func(config, context)
        endDate = self.performance.now()
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
    console.log(`END FUNCTION ${functionName}, time : ${meanDuration}`)
    return {preview, meanDuration, functionName}
}