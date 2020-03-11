cd ../

echo "++++ building maximilian wasm"
cd js/audio-worklet/
make && echo "++++ SUCCESS"
cd ../..


cd benchmarks/cpp

echo "++++ building dynamic-dsp-engine"
cd dynamic-dsp-engine
mkdir -p build
./compile.sh mjs && echo "++++ SUCCESS"
cd ..

echo "++++ building dynamic-dsp-engine-maxi"
cd dynamic-dsp-engine-maxi
mkdir -p build
./compile.sh mjs && echo "++++ SUCCESS"
cd ..

echo "++++ building static-dsp"
cd static-dsp
mkdir -p build
./compile.sh mjs && echo "++++ SUCCESS"
cd ..

cd ..

echo "++++ building assemblyscript compiler for browser"
cd assemblyscript/
npm i
npm run build
cd ..

cd ..