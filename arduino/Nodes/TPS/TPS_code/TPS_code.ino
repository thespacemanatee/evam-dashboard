/*
TPS CODE FOR EVAM

Designed to run on an Arduino Nano
Connect A0 to the throttle 
Connect A1 to the brake

And 

*/


#include <SPI.h>
#include <mcp2515.h>  //arduino-mcp2515 by autowp: https://github.com/autowp/arduino-mcp2515/
#define DEBUG

//timing stuff
#define MSG_INTERVAL 10  //timing delay in ms between messages sent by node
unsigned long lastMessageTime = 0;  //keeps track of the timestamp of the last message sent

//brake
#define BRAKE_PIN A1  //analog pin that the brake pressure sensor is connected to
uint16_t brakeRaw = 0;  //0-1023, raw value from Arduino ADC
float brakePressure = 0;
uint8_t brakeByte = 0; //0-255, for CAN message. Brake Pressure = BrakeBtye * 4
uint8_t brakePercentByte = 0; //0-255, for CAN message. Brake % = BrakePercentByte * 0.4
uint8_t brakePercent;

//throttle
#define ACC_PIN A0  //analog pin that the accelerator is connected to
uint16_t throttleRaw = 0;  //0-1023, raw value from Arduino ADC
uint8_t throttleByte = 0;  //0-255, for CAN message. Throttle % = ThrottleByte * 0.4
uint8_t throttlePercent;
//uint8_t throttleBtyeAvg, brakeByteAvg, brakePercentByteAvg;

//can bus stuff
struct can_frame canStatusMsg;
struct can_frame canAccMsg;
MCP2515 mcp2515(10);


void setup() {
  canStatusMsg.can_id  = 0x0A;
  canStatusMsg.can_dlc = 1;
  canStatusMsg.data[0] = 0;


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
  Serial.println("TPS");
  #endif
  
  mcp2515.reset();
  mcp2515.setBitrate(CAN_500KBPS);
  mcp2515.setNormalMode();
  sendStatus(1);  

}

void loop() {

  
  readThrottle();
  readBrake();
  //average();
  if(millis() - lastMessageTime >= MSG_INTERVAL){
    sendCanMessage();
  }
 
}

void sendCanMessage(){
  canAccMsg.data[0] = throttleByte; //accelerator
  canAccMsg.data[2] = brakeByte; //brake
  canAccMsg.data[4] = brakePercentByte; //brake
  mcp2515.sendMessage(&canAccMsg);
  
  #ifdef DEBUG  //print brake and throttle values
  throttlePercent = float(throttleByte)*0.4;
  brakePressure = float(brakeByte)*4.0;
  brakePercent = float(brakePercentByte)*0.4;
  Serial.print("Throttle = ");
  Serial.print(throttlePercent);
  Serial.print("| Brake Pressure = ");
  Serial.print(brakePressure);
  Serial.print("| Brake Percent = ");
  Serial.println(brakePercent);
  #endif
}

void readThrottle(){
  throttleRaw = analogRead(ACC_PIN);  //reads 10bit ADC value
  throttleByte = map(throttleRaw, 0, 1023, 0, 255);  //maps the 10bit ADC value to 1 byte to be sent on the CANBus
}

void readBrake(){
  brakeRaw = 0;  //from sensor
  brakePressure = (brakeRaw / 1023.0) * 100000.0;  //just guesstimation for now. Bosch seems to have 140,260,420,600 bar sensors, not sure which one is ours.
  brakeByte = map(brakeRaw, 0, 1023, 0, 255);  //maps the 10bit ADC value to 1 byte to be sent on the CANBus. this should be changed once we can test the range of the sensor
  brakePercentByte = 0; //maybe map the brakeRaw
}

/*
//maybe an exponential filter on the values
void average(){
  throttleRawAvg = ???
  brakeRawAvg = ???  //from sensor
}
*/

//to update CANBus on the status of the node
void sendStatus(uint8_t status = 0){
  canStatusMsg.data[0] = status;
  mcp2515.sendMessage(&canStatusMsg);
}
