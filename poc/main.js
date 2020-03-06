const assert = require('assert')
const Engine = require('./build/MyDsp.js')
const engine = Engine()
engine.then(() => {
    engine._initialize(10, 16)
        
    const node_1 = engine._wnode_create(0) // 40
    
    const node_A_2 = engine._wnode_create(1) // +10
    const node_A_3 = engine._wnode_create(1) // +10
    const node_A_4 = engine._wnode_create(2) // *3
    
    const node_B_2 = engine._wnode_create(2) // *3

    const node_triangle = engine._wnode_create(3) // triangle

    engine._wnode_ports_connect(node_1, 0, node_A_2, 0)
    engine._wnode_ports_connect(node_A_2, 0, node_A_3, 0)
    engine._wnode_ports_connect(node_A_3, 0, node_A_4, 0)

    engine._wnode_ports_connect(node_1, 0, node_B_2, 0)

    engine._wnode_ports_connect(node_1, 0, node_triangle, 0)
    
    let outputsPointer, outputValue

    const output_block_pointer = engine._dsp_block(node_1, node_triangle)

    const start = (output_block_pointer>>2)
    const block = engine.HEAPF32.subarray(start, start + 16)
    console.log(block) 
    
    outputsPointer = engine._wnode_read_outputs(node_A_3)
    outputValue = engine.getValue(outputsPointer, 'float')
    assert.equal(outputValue, 60)

    outputsPointer = engine._wnode_read_outputs(node_A_4)
    outputValue = engine.getValue(outputsPointer, 'float')
    assert.equal(outputValue, 180)

    outputsPointer = engine._wnode_read_outputs(node_B_2)
    outputValue = engine.getValue(outputsPointer, 'float')
    assert.equal(outputValue, 120)
})