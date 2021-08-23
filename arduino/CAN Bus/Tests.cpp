uint16_t steeringRaw = 10000 //some 16 bit number; expressed in decimal
int b1 = steeringRaw & 0xFF00; //MSB, no clue if this works lmao
int b2 = steeringRaw & 0x00FF; //LSB
