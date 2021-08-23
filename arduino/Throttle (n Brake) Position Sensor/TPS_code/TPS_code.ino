//----------------------------TPS CODE-----------------------------------------


#include <SPI.h>
#include <mcp2515.h>
#define DEBUG

//timing stuff
const unsigned long messageInterval = 10;  //timing delay in ms between messages sent by node
unsigned long lastMessageTime = 0;  //keeps track of the timestamp of the last message sent

//throttle n brake values
float throttlePercent = 0.0;
float brakePressure = 0.0;
float brakePercent = 0.0;
uint8_t throttleRaw = 0;  //0-255, for CAN message. Throttle % = ThrottleRaw * 0.4
uint8_t brakeRaw = 0; //0-255, for CAN message. Brake Pressure = BrakeRaw * 4
uint8_t brakePercentRaw = 0; //0-255, for CAN message. Brake Percent = BrakePercentRaw * 0.4
uint8_t throttleRawAvg, brakeRawAvg;




//can bus stuff
struct can_frame canAccMsg;
MCP2515 mcp2515(10);


void setup() {
  canAccMsg.can_id  = 0x020;
  canAccMsg.can_dlc = 8;
  canAccMsg.data[0] = 0x00;
  canAccMsg.data[1] = 0x00;
  canAccMsg.data[2] = 0x00;
  canAccMsg.data[3] = 0x00;
  canAccMsg.data[4] = 0x00;
  canAccMsg.data[5] = 0x00;
  canAccMsg.data[6] = 0x00;
  canAccMsg.data[7] = 0x00;

  #ifdef DEBUG  //debug mode
  //while (!Serial);
  Serial.begin(115200);
  Serial.println("TPS ");
  #endif
  
  mcp2515.reset();
  mcp2515.setBitrate(CAN_500KBPS);
  mcp2515.setNormalMode();

}

void loop() {

  
  readThrottle();
  readBrake();
  //average();
  if(millis() - lastMessageTime >= messageInterval){
    sendCanMessage();
  }
 
}

void sendCanMessage(){
  canAccMsg.data[0] = throttleRaw; //accelerator
  canAccMsg.data[2] = brakeRaw; //brake
  canAccMsg.data[4] = brakePercentRaw; //brake
  mcp2515.sendMessage(&canAccMsg);
  
  #ifdef DEBUG  //print brake and throttle values
  throttlePercent = float(throttleRaw)*0.4;
  brakePressure = float(brakeRaw)*4.0;
  brakePercent = float(brakePercentRaw)*0.4;
  Serial.print("Throttle = ");
  Serial.print(throttlePercent);
  Serial.print("| Brake Pressure = ");
  Serial.println(brakePressure);
  #endif
}

void readThrottle(){
  throttleRaw = 0;  //from sensor
}

void readBrake(){
  brakeRaw = 0;  //from sensor
  brakePercentRaw = 0; //maybe map the brakeRaw
}

/*
void average(){
  throttleRawAvg = ???
  brakeRawAvg = ???  //from sensor
}
*/
