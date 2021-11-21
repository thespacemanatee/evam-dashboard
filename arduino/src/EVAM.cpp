#include <EVAM.h>

//Define messages for BLE characteristics
uint8_t coreMessage[3];
uint8_t statusMessage[11];
uint8_t batteryMessage[5];

void checkMotorLockout(){
    motorLockMsg.data.u8[0] = digitalRead(MOTOR_LOCK_PIN);
    #ifdef SERIAL_DEBUG
    Serial.print("Motors: ");
    Serial.println(motorLockMsg.data.u8[0] ? "Locked" : "Unlocked");
    #endif
    ESP32Can.CANWriteFrame(&motorLockMsg);
}

unsigned long prevCoreMillis = 0; //timer for the important data service
unsigned long prevSlowMillis = 0; //timer for the less important data service
unsigned long prevMotorLockMillis = 0;  //timer for motor lock CAN Bus message