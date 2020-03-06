#include <stdio.h>
#include "types.h"
#include "engine.h"
#include "maximilian.h"

extern "C" {
  void initialize(int node_count, int block_size);
  float* dsp_block(NodeId root);
  NodeId wnode_create(int node_type);
  void wnode_ports_connect(NodeId source_id, PortId output, NodeId sink_id, PortId input);
  void* wnode_output_get_pointer(NodeId node_id);
  void* wnode_state_get_pointer(NodeId node_id);
  void wgraph_compile(NodeId root);
}

int BLOCK_SIZE = 0;
float* BLOCK;
float* dsp_block(NodeId root) {

  Node node;
  Operation operation;
  OperationPointerIterator it = operations_get_iterator_begin();
  OperationPointerIterator it_end = operations_get_iterator_end();

  for (it = it; it != it_end; it++ ) {
    operation = **it;
    node = *(operation.node_pointer);
    // printf("LOOP %i\n", node.node_type);

    switch (node.node_type) {
      case 0:
        node.outputs[0] = 40;
        break;
      case 1:
        node.outputs[0] = *node.inputs[0] + 10;
        break;
      case 2:
        node.outputs[0] = *node.inputs[0] * 3;
        break;
      case 3:
        node.outputs[0] = ((maxiOsc*) node.state)->triangle(*node.inputs[0]);
        break;
      case 4:
        // printf("LOOP %i -> %f\n", operation.frame_index, *node.inputs[0]);
        ((float*) node.state)[operation.frame_index] = *node.inputs[0];
        break;
    }
  }
  
  return BLOCK;
};

Node* setup_fixed_40() {
  Node* node_pointer = new Node();
  node_pointer->outputs = new float[1];
  node_pointer->node_type = 0;
  return node_pointer;
}

Node* setup_plus_10() {
  Node* node_pointer = new Node();
  node_pointer->inputs = new float*[1];
  node_pointer->outputs = new float[1];
  node_pointer->node_type = 1;
  return node_pointer;
}

Node* setup_times_3() {
  Node* node_pointer = new Node();
  node_pointer->inputs = new float*[1];
  node_pointer->outputs = new float[1];
  node_pointer->node_type = 2;
  return node_pointer;
}

Node* setup_triangle() {
  Node* node_pointer = new Node();
  node_pointer->state = new maxiOsc();
  node_pointer->inputs = new float*[1];
  node_pointer->outputs = new float[1];
  node_pointer->node_type = 3;
  return node_pointer;
}

Node* setup_buffer() {
  Node* node_pointer = new Node();
  node_pointer->state = new float[BLOCK_SIZE + 1];
  node_pointer->inputs = new float*[1];
  node_pointer->node_type = 4;
  return node_pointer;
}

void wnode_ports_connect(NodeId source_id, PortId output, NodeId sink_id, PortId input) {
  // printf("NODE PORTS CONNECT %i %i -> %i %i\n", source_id, output, sink_id, output);
  return node_ports_connect(source_id, output, sink_id, input);
};

NodeId wnode_create(int node_type) {
  // printf("NODE CREATE %i\n", node_type);
  return node_create(node_type);
};

void wgraph_compile(NodeId root) {
  // printf("GRAPH COMPILE %i\n", root);
  graph_compile(root, BLOCK_SIZE);
}

void* wnode_output_get_pointer(NodeId node_id) {
  return node_output_get_pointer(node_id, 0);
}

void* wnode_state_get_pointer(NodeId node_id) {
  return node_state_get_pointer(node_id);
}

void initialize(int node_count, int block_size) {
  // printf("INTIALIZE\n");
  graph_initialize(node_count);
  node_declare_builder(0, &setup_fixed_40);
  node_declare_builder(1, &setup_plus_10);
  node_declare_builder(2, &setup_times_3);
  node_declare_builder(3, &setup_triangle);
  node_declare_builder(4, &setup_buffer);
  BLOCK_SIZE = block_size;
  BLOCK = new float[BLOCK_SIZE];
}
