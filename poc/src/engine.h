#ifndef ENGINE_H
#define ENGINE_H
#include "types.h"

void graph_initialize(int node_count);
void graph_compile(NodeId root, int block_size);
void node_declare_builder(int key, NodeBuilder node_builder);
NodeId node_create(int node_type);
void node_ports_connect(NodeId source_id, PortId output_id, NodeId sink_id, PortId input_id);
void* node_state_get_pointer(NodeId node_id);
OperationPointerIterator operations_get_iterator_begin();
OperationPointerIterator operations_get_iterator_end();

#endif /* ENGINE_H */