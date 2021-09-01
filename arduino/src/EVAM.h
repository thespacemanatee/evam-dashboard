#include <Arduino.h>
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>

/* UUIDs */
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
uint8_t vel;   //Velocity
uint8_t acc;   //Acceleration
uint8_t brake; //Brake

/* Node status message to be notified */
uint8_t statusMessage[14];
uint8_t ecu;
uint8_t bms;
uint8_t tps;
uint8_t sas;
uint8_t imu;
uint8_t interior; //interior lighting status
uint8_t flw;      //Front left wheel
uint8_t frw;      //Front right wheel
uint8_t rlw;      //Rear left wheel
uint8_t rrw;      //Rear right wheel
uint8_t fll;      //Front left light
uint8_t frl;      //Front right light
uint8_t rll;      //Rear left light
uint8_t rrl;      //Rear right light

/* Battery status message to be notified */
uint8_t batteryMessage[5];
uint8_t battPercent; //Battery percentage
uint8_t battVolt;    //Battery voltage
uint16_t battCurr;   //Battery current
uint8_t battTemp;    //Battery Temperature

/* Lighting messages  */
//format: red, green, blue
uint8_t frontLightingMessage[3];
uint8_t rearLightingMessage[3];
uint8_t interiorLightingMessage[3];

void setVehicleLights(uint8_t *lightArr, uint8_t *value);
void updateCoreData();
void updateStatusData();
void updateBatteryData();
void updateLightingData(); //to update CANBus
void setCoreCharacteristic();
void setStatusCharacteristic();
void setBatteryCharacteristic();
void setLightingCharacteristic();

/* For Debug */
#define ACC_PIN 34