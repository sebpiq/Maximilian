export const createGraph = (container, {size, xValues, xScale, yScale}) => {
    const marginSize = size / 10
    const svg = d3.select(container)
        .append('svg')
            .attr('width', size + marginSize * 2)
            .attr('height', size + marginSize * 2)
            .attr('class', 'graph')
    
    const plotContainer = svg.append('g')
        .attr('class', 'container')
        .attr('transform', 
            'translate(' + marginSize + ',' + marginSize + ')')
    
    // Set the ranges
    xScale
        .range([0, size])
        .domain([_.min(xValues), _.max(xValues)])
    
    yScale
        .range([size, 0])

    // Define the axes
    const xAxis = d3.axisBottom(xScale).tickFormat(d3.format(".0s"))
    const yAxis = d3.axisLeft(yScale).ticks(5).tickFormat(d3.format(".2f"))

    // Add the X Axis
    plotContainer.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + size + ')')
        .call(xAxis)

    // Add the Y Axis
    plotContainer.append('g')
        .attr('class', 'y axis')
        .call(yAxis)

    // Add the X Axis
    const legend = plotContainer.append('g')
        .attr('class', 'legend')
        .append('text')
        // .attr('transform', 'translate(0,' + size + ')')

    return {
        svg, plotContainer, xScale, yScale, xValues, legend
    }
}

export const plotSignal = (graph, samples, style) => {
    // Define the line
    const valueline = d3.line()
        .x((d, i) => graph.xScale(graph.xValues[i]))
        .y((d) => graph.yScale(d))

    // Add the valueline path.
    const path = graph.plotContainer.append('path')
        .attr('class', 'line')
        .attr('d', valueline(samples))
    
    _.toPairs(style).forEach(([key, value]) => {
        path.style(key, value)
    })
}

export const plotLegend = (graph, name, color) => {
    graph.legend.append('tspan')
        .text(` ${name} `)
        .style('fill', color)
}