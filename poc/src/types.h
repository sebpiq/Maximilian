#ifndef TYPES_H
#define TYPES_H
#include <map>
#include <vector>

typedef int NodeType;
typedef int NodeId;
typedef int PortId;

typedef void(*NodeProcessor)(void*);

struct Node {
  NodeType node_type;
  void* state;
  float** input_pointers;
  float* output;
};

struct Operation {
  int frame_index;
  Node* node_pointer;
};

typedef std::vector<Operation*>::iterator OperationPointerIterator;

typedef Node*(*NodeBuilder)();

typedef std::map<NodeType, NodeBuilder> NodeBuilders;

#endif /* TYPES_H */