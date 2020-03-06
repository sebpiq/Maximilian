if emcc audio.c \
  -O2 \
  -s MODULARIZE=1 \
  -s WASM=1 \
  -s "EXPORT_NAME='WasmAudioModule'" \
  -s "BINARYEN_METHOD='native-wasm'" \
  -s "EXPORTED_FUNCTIONS=['_triangle', '_triangleVector']" \
  -o audio.mjs ; 
then
  echo "compilation succeeded"
fi