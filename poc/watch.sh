echo "WATCH..."
while true; do
  echo "COMPILING..." \
    && ./compile.sh js \
    && echo "TESTING..." \
    && node main.js
  echo ""
  inotifywait -q --event modify --format '%w' ./src/*
done