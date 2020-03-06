if emcc \
  src/my_dsp.cpp src/engine.cpp ../src/maximilian.cpp \
  -I/home/spiq/code/Maximilian/poc/ \
  -I/home/spiq/code/Maximilian/src/ \
  -O2 \
  --bind \
	-s BINARYEN_ASYNC_COMPILATION=0 \
	-s SINGLE_FILE=1 \
	-s ALLOW_MEMORY_GROWTH=1 \
	-s ABORTING_MALLOC=0 \
	-s TOTAL_MEMORY=128Mb \
  --js-opts 0 -g4 \
  -s MODULARIZE=1 \
  -s WASM=1 \
  -s "EXPORT_NAME='MyDsp'" \
  -s "BINARYEN_METHOD='native-wasm'" \
  -s "EXPORTED_FUNCTIONS=['_wcreate_node', '_dsp_block', '_wconnect_ports', '_wget_node_outputs', '_initialize']" \
  -s "EXTRA_EXPORTED_RUNTIME_METHODS=['getValue']" \
  -o build/MyDsp.mjs; 
then
  echo "compilation succeeded"
fi

# -s "EXPORTED_FUNCTIONS=['_state_management']" \
# -s EXPORT_ALL=1