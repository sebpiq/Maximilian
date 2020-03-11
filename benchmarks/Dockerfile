FROM trzeci/emscripten

ENV HOME=/home/Maximilian/
RUN mkdir $HOME
COPY ./ $HOME

RUN cd $HOME/benchmarks && ./build.sh
ENTRYPOINT npx http-server $HOME/benchmarks/public -p 8080