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

void triangleVector(double* phaseState, float* out_block, int block_size, double frequency) {
  for (int j=0; j<block_size; j++) {
    out_block[j] = triangle(phaseState, frequency);
  }
}