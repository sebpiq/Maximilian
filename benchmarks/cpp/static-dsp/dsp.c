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

double PHASE_VECTOR = 0.0;
void triangleVector(double frequency) {
  for (int j=0; j<BLOCK_SIZE; j++) {
    if ( PHASE_VECTOR >= 1.0 ) PHASE_VECTOR -= 1.0;
    PHASE_VECTOR += (1./(44000/frequency));
    if (PHASE_VECTOR <= 0.5 ) {
        BLOCK[j] =(PHASE_VECTOR - 0.25) * 4;
    } else {
        BLOCK[j] =((1.0-PHASE_VECTOR) - 0.25) * 4;
    }
  }
}