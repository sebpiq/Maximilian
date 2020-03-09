#ifndef TYPES_H
#define TYPES_H
#include <map>
#include <vector>

typedef int NodeType;
typedef int NodeId;
typedef int PortId;
typedef float* PortList;
typedef float** InputList;

typedef void(*NodeProcessor)(void*, PortList, PortList);

struct Node {
  NodeType node_type;
  void* state;
  InputList inputs;
  PortList outputs;
};

struct Operation {
  int frame_index;
  Node* node_pointer;
};

typedef std::vector<Operation*>::iterator OperationPointerIterator;

typedef Node*(*NodeBuilder)();

typedef std::map<NodeType, NodeBuilder> NodeBuilders;

#endif /* TYPES_H */