if emcc \
  dsp.c \
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
  -s "EXPORT_NAME='StaticDsp'" \
  -s "BINARYEN_METHOD='native-wasm'" \
  -s "EXPORTED_FUNCTIONS=['_triangle', '_triangleVector', '_allocate_block']" \
  -o build/StaticDsp.mjs ; 
then
  echo "compilation succeeded"
fi