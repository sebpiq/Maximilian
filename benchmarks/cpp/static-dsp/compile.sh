if emcc dsp.c \
  -O2 \
  -s MODULARIZE=1 \
  -s WASM=1 \
  -s "EXPORT_NAME='StaticDsp'" \
  -s "BINARYEN_METHOD='native-wasm'" \
  -s "EXPORTED_FUNCTIONS=['_triangle', '_triangleVector', '_allocate_block']" \
  -o build/StaticDsp.mjs ; 
then
  echo "compilation succeeded"
fi