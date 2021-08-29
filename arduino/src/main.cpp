/*
    Video: https://www.youtube.com/watch?v=oCMOYS71NIU
    Based on Neil Kolban example for IDF: https://github.com/nkolban/esp32-snippets/blob/master/cpp_utils/tests/BLE%20Tests/SampleNotify.cpp
    Ported to Arduino ESP32 by Evandro Copercini
    updated by chegewara

   Create a BLE server that, once we receive a connection, will send periodic notifications.
   The service advertises itself as: 4fafc201-1fb5-459e-8fcc-c5c9c331914b
   And has a characteristic of: beb5483e-36e1-4688-b7f5-ea07361b26a8

   The design of creating the BLE server is:
   1. Create a BLE Server
   2. Create a BLE Service
   3. Create a BLE Characteristic on the Service
   4. Create a BLE Descriptor on the characteristic
   5. Start the service.
   6. Start advertising.

   A connect hander associated with the server starts a background task that performs notification
   every couple of seconds.
*/
#include <Arduino.h>
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>

BLEServer *pServer = NULL;
BLECharacteristic *pCoreCharacteristic = NULL;
BLECharacteristic *pStatusCharacteristic = NULL;
BLECharacteristic *pLightingCharacteristic = NULL;
bool deviceConnected = false;
bool oldDeviceConnected = false;
unsigned long prevSendMillis = 0;
unsigned long prevMillis = 0;

/////////CORE MESSAGE////////////////
uint8_t coreMessage[8];
uint8_t vel = 35;
uint8_t acc = 0;
uint8_t brake = 0;
uint8_t battPercent = 95;
uint8_t battVol = 78;
uint16_t battCurr = 10000;
uint8_t battTemp = 35;

//////////NODE STATUS MESSAGE////////////////
uint8_t statusMessage[8];
uint8_t ecu = 0;
uint8_t bms = 0;
uint8_t tps = 0;
uint8_t sas = 0;
//wheels
uint8_t flw = 255;
uint8_t frw = 255;
uint8_t rlw = 255;
uint8_t rrw = 255;
//lights

/////////LIGHTING MESSAGE/////////////
uint8_t lightingMessage[9];
uint8_t frontR = 255;
uint8_t frontG = 255;
uint8_t frontB = 255;
uint8_t rearR = 0;
uint8_t rearG = 0;
uint8_t rearB = 0;
uint8_t intR = 0;
uint8_t intG = 0;
uint8_t intB = 0;

////////////UUIDs////////////////////////////////

// See the following for generating UUIDs:
// https://www.uuidgenerator.net/

#define SERVICE_UUID "4fafc201-1fb5-459e-8fcc-c5c9c331914b"
#define CORE_CHARACTERISTIC_UUID "beb5483e-36e1-4688-b7f5-ea07361b26a8"
#define STATUS_CHARACTERISTIC_UUID "5d2e6e74-31f0-445e-8088-827c53b71166"
#define LIGHTING_CHARACTERISTIC_UUID "825eef3b-e3d0-4ca6-bef7-6428b7260f35"

class MyServerCallbacks : public BLEServerCallbacks
{
  void onConnect(BLEServer *pServer)
  {
    deviceConnected = true;
  };

  void onDisconnect(BLEServer *pServer)
  {
    deviceConnected = false;
  }
};

void setup()
{
  Serial.begin(115200);

  // Create the BLE Device
  BLEDevice::init("EVAM");

  // Create the BLE Server
  pServer = BLEDevice::createServer();
  pServer->setCallbacks(new MyServerCallbacks());

  // Create the BLE Service
  BLEService *pService = pServer->createService(SERVICE_UUID);

  // Create a BLE Characteristic
  pCoreCharacteristic = pService->createCharacteristic(
      CORE_CHARACTERISTIC_UUID,
      BLECharacteristic::PROPERTY_READ
      //| BLECharacteristic::PROPERTY_WRITE
      | BLECharacteristic::PROPERTY_NOTIFY 
      //| BLECharacteristic::PROPERTY_INDICATE
      );

  pStatusCharacteristic = pService->createCharacteristic(
      STATUS_CHARACTERISTIC_UUID,
      BLECharacteristic::PROPERTY_READ
      //| BLECharacteristic::PROPERTY_WRITE
      | BLECharacteristic::PROPERTY_NOTIFY 
      //| BLECharacteristic::PROPERTY_INDICATE
      );

  pLightingCharacteristic = pService->createCharacteristic(
      LIGHTING_CHARACTERISTIC_UUID,
      BLECharacteristic::PROPERTY_READ
      | BLECharacteristic::PROPERTY_WRITE
      //| BLECharacteristic::PROPERTY_NOTIFY 
      //| BLECharacteristic::PROPERTY_INDICATE
      );

  // https://www.bluetooth.com/specifications/gatt/viewer?attributeXmlFile=org.bluetooth.descriptor.gatt.client_characteristic_configuration.xml
  // Create a BLE Descriptor

  pCoreCharacteristic->addDescriptor(new BLE2902());
  pStatusCharacteristic->addDescriptor(new BLE2902());
  pLightingCharacteristic->addDescriptor(new BLE2902());


  // Start the service
  pService->start();

  // Start advertising
  BLEAdvertising *pAdvertising = BLEDevice::getAdvertising();
  pAdvertising->addServiceUUID(SERVICE_UUID);
  pAdvertising->setScanResponse(false);
  pAdvertising->setMinPreferred(0x0); // set value to 0x00 to not advertise this parameter
  BLEDevice::startAdvertising();
  Serial.println("Waiting a client connection to notify...");
}
////////////////////////////UPDATE DATA FROM CAR///////////////////////////////////////////

//updates core data for the core characteristic. Will eventually use CANBus data
void updateCoreData(){
  //for now is hardcoded data
  if (vel < 100)
    {
      vel++;
    }
    else
    {
      vel = 0;
    }

    if (acc < 100)
    {
      acc++;
    }
    else
    {
      acc = 0;
    }

    if (brake > 0)
    {
      brake--;
    }
    else
    {
      brake = 100;
    }
}

//updates CAN Bus node status for the status characteristic. Will eventually use CANBus data
void updateStatusData(){
  //in progress

}

//updates lighting values for the status characteristic
void updateLightingData(){
  //in progress

}
////////////////////////////SET CHARACTERISTIC DATA/////////////////////////////////////////

//sets new data for core characteristic and notifies
void setCoreCharacteristic(){
  coreMessage[0] = vel;
  coreMessage[1] = acc;
  coreMessage[2] = brake;
  coreMessage[3] = battPercent;
  coreMessage[4] = battVol;
  coreMessage[5] = (uint8_t)(battCurr >> 8);
  coreMessage[6] = (uint8_t)(battCurr & 0x00FF);
  coreMessage[7] = battTemp;
  pCoreCharacteristic->setValue((uint8_t *)coreMessage, sizeof(coreMessage));
  pCoreCharacteristic->notify();
}

//sets new data for node characteristic and notifies
void setStatusCharacteristic(){
  statusMessage[0] = ecu;
  statusMessage[1] = bms;
  statusMessage[2] = tps;
  statusMessage[3] = sas;
  statusMessage[4] = flw;
  statusMessage[5] = frw;
  statusMessage[6] = rlw;
  statusMessage[7] = rrw;
  pStatusCharacteristic->setValue((uint8_t *)statusMessage, sizeof(statusMessage));
  pStatusCharacteristic->notify();
}

void setLightingCharacteristic(){
  lightingMessage[0] = frontR;
  lightingMessage[1] = frontG;
  lightingMessage[2] = frontB;
  lightingMessage[3] = rearR;
  lightingMessage[4] = rearG;
  lightingMessage[5] = rearB;
  lightingMessage[6] = intR;
  lightingMessage[7] = intG;
  lightingMessage[8] = intB;
  pLightingCharacteristic->setValue((uint8_t *)lightingMessage, sizeof(lightingMessage));

}

void loop()
{
  unsigned long currentMillis = millis();
  if (currentMillis - prevMillis > 100) //update once every 100ms
  {
    updateCoreData();
    updateStatusData();
    updateLightingData();
    prevMillis = currentMillis;
  }
  
  if (deviceConnected && currentMillis - prevSendMillis > 200) //publish
  {
    setCoreCharacteristic();
    setStatusCharacteristic();
    setLightingCharacteristic();
    prevSendMillis = currentMillis;
  }

 
  // disconnecting
  if (!deviceConnected && oldDeviceConnected)
  {
    delay(500);                  // give the bluetooth stack the chance to get things ready
    pServer->startAdvertising(); // restart advertising
    Serial.println("Start advertising...");
    oldDeviceConnected = deviceConnected;
  }
  // connecting
  if (deviceConnected && !oldDeviceConnected)
  {
    // do stuff here on connecting
    oldDeviceConnected = deviceConnected;
  }
}

