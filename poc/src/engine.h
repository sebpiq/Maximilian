#ifndef ENGINE_H
#define ENGINE_H
#include "types.h"

void declare_node_builder(int key, NodeBuilder node_builder);
void initialize_graph(int node_count);
NodeKey create_node(int node_type);
void connect_ports(NodeKey source_key, PortKey output, NodeKey sink_key, PortKey input);
void dsp_loop(NodeKey root);
void* get_node_output(NodeKey node_key, PortKey port_key);

#endif /* ENGINE_H */