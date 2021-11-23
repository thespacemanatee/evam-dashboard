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

/********** SETTING CHARACTERISTICS ***********/

//plan to move to hud_ble.h
/* Sets new data for core characteristic and notifies */
void setCoreCharacteristic()
{
    pCoreCharacteristic->setValue((uint8_t *)coreMessage, sizeof(coreMessage));
    pCoreCharacteristic->notify();
}

/* Sets new data for node status characteristic and notifies  */
void setStatusCharacteristic()
{
    pStatusCharacteristic->setValue((uint8_t *)statusMessage, sizeof(statusMessage));
    pStatusCharacteristic->notify();
  }

/* Sets new data for battery characteristic and notifies*/
void setBatteryCharacteristic()
{
    pBatteryCharacteristic->setValue((uint8_t *)batteryMessage, sizeof(batteryMessage));
    pBatteryCharacteristic->notify();
}