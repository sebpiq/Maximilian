#include <stdio.h>
#include "types.h"
#include "engine.h"
#include "deps/graph.cpp"


Node NODES[100];
int NODE_ID_COUNTER = -1;
NodeBuilders NODE_BUILDERS;
graph* DSP_GRAPH;
Node* FLATTENED_GRAPH[100];

NodeKey _get_ununsed_key() {
  NODE_ID_COUNTER++;
  return NODE_ID_COUNTER;
}

int _get_node_count() {
  return NODE_ID_COUNTER + 1;
}

NodeKey _store_node(Node* node_pointer) {
  NodeKey node_key = _get_ununsed_key();
  NODES[node_key] = *node_pointer;
  return node_key;
}

Node* _get_node_pointer(NodeKey node_key) {
  return &NODES[node_key];
}

void node_declare_builder(int key, NodeBuilder node_builder) {
  NODE_BUILDERS.insert(NodeBuilders::value_type(key, node_builder));
}

void graph_initialize(int node_count) {
  DSP_GRAPH = new graph(node_count);
}

void graph_compile(NodeKey root) {
  NodeKey* flattened_graph_keys = new NodeKey[_get_node_count()];
  DSP_GRAPH->bfs(root, flattened_graph_keys);
  for (int i = 0; i < _get_node_count(); i++) {
    FLATTENED_GRAPH[i] = _get_node_pointer(flattened_graph_keys[i]);
    // printf("%i : %p %p\n", flattened_graph_keys[i], FLATTENED_GRAPH[i], &NODES[i]);
  }
}

NodeKey node_create(int node_type) {
  // printf ("ADD NODE TYPE %i\n", node_type);
  NodeBuilder node_builder = NODE_BUILDERS.at(node_type);
  return _store_node(node_builder());
}

void node_ports_connect(NodeKey source_key, PortKey output_key, NodeKey sink_key, PortKey input_key) {
  // printf("CONNECT %i -> %i \n", source, sink);
  Node source = *_get_node_pointer(source_key);
  Node sink = *_get_node_pointer(sink_key);
  sink.inputs[input_key] = source.outputs[output_key];
  DSP_GRAPH->addEdge(source_key, sink_key);
}

void dsp_loop(NodeKey root) {
  int node_count = _get_node_count();
  // printf("%p %p", &FLATTENED_GRAPH[0], &NODES[0]);
  // printf("LOOP START %i\n", node_count);
	for (int i = 0; i < node_count; i++) {
    // printf("LOOP %p\n", &FLATTENED_GRAPH[i]);
    Node node = *FLATTENED_GRAPH[i];
    node.processor(node.state, node.inputs, node.outputs);
  }
}

void* node_read_output(NodeKey node_key, PortKey port_key) {
  Node node = *_get_node_pointer(node_key);
  return node.outputs[port_key];
}