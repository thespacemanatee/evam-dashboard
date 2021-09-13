#define SERIAL_DEBUG    //flag to turn on/off Serial.print (not used for now)
#define CAN_CONNECTED   //flag to turn on/off CANBus functions for testing

#include <Arduino.h>
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>

#ifdef CAN_CONNECTED
#include <SPI.h>
#include <mcp2515.h>  //arduino-mcp2515 by autowp: https://github.com/autowp/arduino-mcp2515/
#endif  //CAN_CONNECTED



/* CAN Bus */
MCP2515 mcp2515(10);    //instantiate CANBus

struct can_frame frontLightMsg; //front light CAN message
struct can_frame rearLightMsg;  //rear light CAN message
struct can_frame intLightMsg;   //interior light CAN message
struct can_frame canMsg; //for reading messages from the CANBus

/* BLE Services and Characteristics */
#define CORE_SERVICE_UUID "4fafc201-1fb5-459e-8fcc-c5c9c331914b"
#define STATUS_SERVICE_UUID "4ee1bbf0-5e71-4d58-9ce4-e3e45cb8d8f9"
#define LIGHTING_SERVICE_UUID "1cbef3f2-12d5-4490-8a80-7f7970b51b54"
#define CORE_CHARACTERISTIC_UUID "beb5483e-36e1-4688-b7f5-ea07361b26a8"
#define STATUS_CHARACTERISTIC_UUID "5d2e6e74-31f0-445e-8088-827c53b71166"
#define BATTERY_CHARACTERISTIC_UUID "3a9a4b03-75a4-48fb-a071-af568425664e"
#define FRONT_LIGHTING_CHARACTERISTIC_UUID "825eef3b-e3d0-4ca6-bef7-6428b7260f35"
#define REAR_LIGHTING_CHARACTERISTIC_UUID "db598591-bffe-46dd-9967-fbf869e88b3f"
#define INTERIOR_LIGHTING_CHARACTERISTIC_UUID "8ecaaefa-f62f-4376-a4c8-32c74f62d950"

#define CORE_DATA_REFRESH_INTERVAL 16
#define SLOW_DATA_REFRESH_INTERVAL 100

BLEServer *pServer;           //main BLE server
BLEService *pCoreService;     //service for core data
BLEService *pStatusService;   //service for CANBus node status data
BLEService *pLightingService; //service for lighting data
BLECharacteristic *pCoreCharacteristic;
BLECharacteristic *pStatusCharacteristic;
BLECharacteristic *pBatteryCharacteristic;
BLECharacteristic *pFrontLightingCharacteristic;
BLECharacteristic *pRearLightingCharacteristic;
BLECharacteristic *pInteriorLightingCharacteristic;
BLECharacteristicCallbacks *lightingCallback;

bool deviceConnected = false;
bool oldDeviceConnected = false;
unsigned long prevCoreMillis = 0; //timer for the important data service
unsigned long prevSlowMillis = 0; //timer for the less important data service

/* Core message to be notified */
uint8_t coreMessage[3];
#ifndef CAN_CONNECTED
uint8_t vel;   //Car velocity, 0-255km/h
uint8_t acc;   //Accelerator percentage, 0-100%
uint8_t brake; //Brake percentage, 0-100%
#endif

/* Node status message to be notified:
    statusMessage[0] = ecu;
    statusMessage[1] = bms;
    statusMessage[2] = tps;
    statusMessage[3] = sas;
    statusMessage[4] = imu;
    statusMessage[5] = fw;
    statusMessage[6] = rlw;
    statusMessage[7] = rrw;
    statusMessage[8] = fl;
    statusMessage[9] = rl;
    statusMessage[10] = interior; 
    0: error, 1: ok, 255: offline
*/
uint8_t statusMessage[11];
#ifndef CAN_CONNECTED
uint8_t ecu;    //engine control unit
uint8_t bms;    //battery management system
uint8_t tps;    //throttle (and brake) position sensor
uint8_t sas;    //steering angle sensor
uint8_t imu;    //inertial measurment unit
uint8_t fw;     //Front wheels
uint8_t rlw;    //Rear left wheel
uint8_t rrw;    //Rear right wheel
uint8_t fl;     //Front lights
uint8_t rl;     //Rear lights
uint8_t interior; //interior lights
#endif

/* Battery status message to be notified 
*/
uint8_t batteryMessage[5];
#ifndef CAN_CONNECTED
uint8_t battPercent; //Battery percentage
uint8_t battVolt;    //Battery voltage
uint16_t battCurr;   //Battery current
uint8_t battTemp;    //Battery Temperature
#endif

/*  Lighting messages, removed
 *  format: red, green, blue
 */
// uint8_t frontLightingMessage[3];
// uint8_t rearLightingMessage[3];
// uint8_t interiorLightingMessage[3];

#define FRONT_LIGHT 1
#define REAR_LIGHT 2
#define INT_LIGHT 3

#ifdef CAN_CONNECTED
void initCoreMsg();
void initLightingMsg();
void initBattMsg();
void initStatusMsg();
void readCAN();
#endif

void setVehicleLights(uint8_t *value, uint8_t location); //updates the CANBus on the new light data
void updateCoreData();
void updateStatusData();
void updateBatteryData();
void setCoreCharacteristic();
void setStatusCharacteristic();
void setBatteryCharacteristic();
#ifndef CAN_CONNECTED
void setCoreCharacteristicOld();    //for use without CANBus
void setStatusCharacteristicOld();  //for use without CANBus
void setBatteryCharacteristicOld(); //for use without CANBus
#endif
void setLightingCharacteristic();

/* For Debug */
#define ACC_PIN 34