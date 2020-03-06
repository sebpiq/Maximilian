#include <stdio.h>
#include "types.h"
#include "engine.h"
#include "maximilian.h"

extern "C" {
  void initialize(int node_count, int block_size);
  float* dsp_block(NodeKey root, NodeKey leaf);
  NodeKey wnode_create(int node_type);
  void wnode_ports_connect(NodeKey source_key, PortKey output, NodeKey sink_key, PortKey input);
  void* wnode_read_outputs(NodeKey node_key);
}

void triangle(maxiOsc* osc, float** inputs, float** outputs) {
  outputs[0][0] = osc->triangle(inputs[0][0]);
}

Node* setup_triangle() {
  Node* node_pointer = new Node();
  node_pointer->state = new maxiOsc();
  node_pointer->inputs = new void*[1];
  node_pointer->outputs = (PortList) new float*[1] {new float[1]};
  node_pointer->processor = (NodeProcessor) &triangle;
  return node_pointer;
}

void fixed_4(float* state, float** inputs, float** outputs) {
  outputs[0][0] = 40;
}

Node* setup_fixed_4() {
  Node* node_pointer = new Node();
  node_pointer->outputs = (PortList) new float*[1] {new float[1]};
  node_pointer->processor = (NodeProcessor) &fixed_4;
  return node_pointer;
}

void plus_10(float* state, float** inputs, float** outputs) {
  outputs[0][0] = inputs[0][0] + 10;
}

Node* setup_plus_10() {
  Node* node_pointer = new Node();
  node_pointer->inputs = new void*[1];
  node_pointer->outputs = (PortList) new float*[1] {new float[1]};
  node_pointer->processor = (NodeProcessor) &plus_10;
  return node_pointer;
}

void times_3(float* state, float** inputs, float** outputs) {
  outputs[0][0] = inputs[0][0] * 3;
}

Node* setup_times_3() {
  Node* node_pointer = new Node();
  node_pointer->inputs = new void*[1];
  node_pointer->outputs = (PortList) new float*[1] {new float[1]};
  node_pointer->processor = (NodeProcessor) &times_3;
  return node_pointer;
}

int BLOCK_SIZE = 0;
float* BLOCK;
float* dsp_block(NodeKey root, NodeKey leaf) {
  graph_compile(root);
  float* leaf_output = (float*) node_read_output(leaf, 0);
  for (int i = 0; i < BLOCK_SIZE; i++) {
    dsp_loop(root);
    BLOCK[i] = *leaf_output;
  }
  return BLOCK;
};

void wnode_ports_connect(NodeKey source_key, PortKey output, NodeKey sink_key, PortKey input) {
  return node_ports_connect(source_key, output, sink_key, input);
};

NodeKey wnode_create(int node_type) {
  return node_create(node_type);
};

void* wnode_read_outputs(NodeKey node_key) {
  return node_read_output(node_key, 0);
}

void initialize(int node_count, int block_size) {
  graph_initialize(node_count);
  node_declare_builder(0, &setup_fixed_4);
  node_declare_builder(1, &setup_plus_10);
  node_declare_builder(2, &setup_times_3);
  node_declare_builder(3, &setup_triangle);
  BLOCK_SIZE = block_size;
  BLOCK = new float[BLOCK_SIZE];
}
