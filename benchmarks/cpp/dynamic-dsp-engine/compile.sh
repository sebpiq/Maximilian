if emcc \
  src/dsp.cpp src/engine.cpp \
  -I./ \
  -O3 \
  --bind \
	-s BINARYEN_ASYNC_COMPILATION=0 \
	-s SINGLE_FILE=1 \
	-s ALLOW_MEMORY_GROWTH=1 \
	-s ABORTING_MALLOC=0 \
	-s TOTAL_MEMORY=128Mb \
  --js-opts 0 -g4 \
  -s MODULARIZE=1 \
  -s WASM=1 \
  -s "EXPORT_NAME='DynamicDspEngine'" \
  -s "BINARYEN_METHOD='native-wasm'" \
  -s "EXPORTED_FUNCTIONS=['_wnode_create', '_dsp_block', '_wnode_ports_connect', '_wnode_state_get_pointer', '_initialize', '_wgraph_compile']" \
  -s "EXTRA_EXPORTED_RUNTIME_METHODS=['getValue']" \
  -o "build/DynamicDspEngine.$1"; 
then
  echo "compilation succeeded"
else
  exit 1;
fi