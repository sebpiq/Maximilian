#ifndef TYPES_H
#define TYPES_H
#include <map>
#include <vector>

typedef int NodeType;
typedef int NodeId;
typedef int PortId;

typedef float** InputPointers;
typedef float* Outputs;
typedef void* State;

typedef void(*NodeProcessor)(State, InputPointers, Outputs, int);

struct Node {
  NodeType node_type;
  State state;
  InputPointers input_pointers;
  Outputs outputs;
  NodeProcessor processor;
};

struct Operation {
  int frame_index;
  Node* node_pointer;
};

typedef std::vector<Operation*>::iterator OperationPointerIterator;

typedef Node*(*NodeBuilder)();

typedef std::map<NodeType, NodeBuilder> NodeBuilders;

#endif /* TYPES_H */