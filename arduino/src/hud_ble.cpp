#include <hud_ble.h>

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
