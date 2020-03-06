#include <stdio.h>
#include "types.h"
#include "engine.h"
#include "deps/graph.cpp"


Node* NODES[100];
int NODE_COUNTER = -1;
NodeBuilders NODE_BUILDERS;
graph* DSP_GRAPH;

NodeKey _get_ununsed_key() {
  NODE_COUNTER++;
  return NODE_COUNTER;
}

NodeKey _store_node(Node* node_pointer) {
  NodeKey node_key = _get_ununsed_key();
  NODES[node_key] = node_pointer;
  return node_key;
}

Node* _get_node(NodeKey node_key) {
  return NODES[node_key];
}

void declare_node_builder(int key, NodeBuilder node_builder) {
  NODE_BUILDERS.insert(NodeBuilders::value_type(key, node_builder));
}

void initialize_graph(int node_count) {
  DSP_GRAPH = new graph(node_count);
}

NodeKey create_node(int node_type) {
  // printf ("ADD NODE TYPE %i\n", node_type);
  NodeBuilder node_builder = NODE_BUILDERS.at(node_type);
  Node* node_pointer = node_builder();
  return _store_node(node_pointer);
}

void connect_ports(NodeKey source_key, PortKey output_key, NodeKey sink_key, PortKey input_key) {
  // printf("CONNECT %i -> %i \n", source, sink);
  Node* source = _get_node(source_key);
  Node* sink = _get_node(sink_key);
  sink->inputs[input_key] = source->outputs[output_key];
  DSP_GRAPH->addEdge(source_key, sink_key);
}

void _run_node(NodeKey parent_key, NodeKey child_key) {
  Node* node = NODES[child_key];
  Node* parent = NODES[parent_key];
  // printf("%i ---> %i\n", parent_key, child_key);
  node->processor(node->state, node->inputs, node->outputs);
}

void dsp_loop(NodeKey root) {
	DSP_GRAPH->bfs(root, &_run_node);
}

void* get_node_output(NodeKey node_key, PortKey port_key) {
  Node* node_pointer = _get_node(node_key);
  return node_pointer->outputs[port_key];
}