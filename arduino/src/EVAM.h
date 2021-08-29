#include <Arduino.h>
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>

/* UUIDs */
#define CORE_SERVICE_UUID "4fafc201-1fb5-459e-8fcc-c5c9c331914b"
#define LIGHTING_SERVICE_UUID "1cbef3f2-12d5-4490-8a80-7f7970b51b54"
#define CORE_CHARACTERISTIC_UUID "beb5483e-36e1-4688-b7f5-ea07361b26a8"
#define STATUS_CHARACTERISTIC_UUID "5d2e6e74-31f0-445e-8088-827c53b71166"
#define LIGHTING_CHARACTERISTIC_UUID "825eef3b-e3d0-4ca6-bef7-6428b7260f35"

#define CORE_DATA_REFRESH_INTERVAL 100
#define SLOW_DATA_REFRESH_INTERVAL 500


BLEServer *pServer;
BLEService *pCoreService;
BLEService *pLightingService;
BLECharacteristic *pCoreCharacteristic;
BLECharacteristic *pStatusCharacteristic;
BLECharacteristic *pLightingCharacteristic;
BLEDescriptor *pCoreDescriptor;
BLEDescriptor *pStatusDescriptor;
BLEDescriptor *pLightingDescriptor;

bool deviceConnected = false;
bool oldDeviceConnected = false;
unsigned long prevCoreMillis = 0;   //timer for the important data service
unsigned long prevSlowMillis = 0;   //timer for the less important data serv

/* CORE MESSAGE */
uint8_t coreMessage[8];
uint8_t vel = 35; //Velocity
uint8_t acc = 0; //Acceleration
uint8_t brake = 0; //Brake
uint8_t battPercent = 95; //Battery percentage
uint8_t battVol = 78; //Battery voltage
uint16_t battCurr = 10000; //Battery current
uint8_t battTemp = 35; //Battery Temperature

/* NODE STATUS MESSAGE */
uint8_t statusMessage[8];
uint8_t ecu = 0;
uint8_t bms = 0;
uint8_t tps = 0;
uint8_t sas = 0;
uint8_t flw = 255; //Front left wheel
uint8_t frw = 255; //Front right wheel
uint8_t rlw = 255; //Rear left wheel
uint8_t rrw = 255; //Rear right wheel

/* LIGHTING MESSAGE  */
//format: frontR,frontG,frontB, rearR,rearG,rearB, interiorR,interiorG,interiorB
uint8_t lightingMessage[9];
/* //values are updated from the callback function
uint8_t frontR = 255;
uint8_t frontG = 255;
uint8_t frontB = 255;
uint8_t rearR = 0;
uint8_t rearG = 0;
uint8_t rearB = 0;
uint8_t intR = 0;
uint8_t intG = 0;
uint8_t intB = 0;
*/

void updateCoreData();
void updateStatusData();
//void updateLightingData();    //not used; values are updated from the callback function
void setCoreCharacteristic();
void setStatusCharacteristic();
void setLightingCharacteristic();
