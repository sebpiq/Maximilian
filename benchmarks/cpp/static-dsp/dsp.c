#include <stdlib.h>

float* BLOCK;
int BLOCK_SIZE;
float* allocate_block(int size) {
  BLOCK = (float *)malloc(sizeof(float)*size);
  BLOCK_SIZE = size;
  return BLOCK;
}

double triangle(double* phaseState, double frequency) {
    double phase = phaseState[0];
    double output;

    if ( phase >= 1.0 ) phase -= 1.0;
    phase += (1./(44000/frequency));
    if (phase <= 0.5 ) {
        output =(phase - 0.25) * 4;
    } else {
        output =((1.0-phase) - 0.25) * 4;
    }
    phaseState[0] = phase;
    return output;
}

void triangleVector(double frequency) {
  double phaseState [1];
  for (int j=0; j<BLOCK_SIZE; j++) {
    BLOCK[j] = triangle(phaseState, frequency);
  }
}