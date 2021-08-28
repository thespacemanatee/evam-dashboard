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
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>

BLEServer *pServer = NULL;
BLECharacteristic *pCoreCharacteristic = NULL;
bool deviceConnected = false;
bool oldDeviceConnected = false;
unsigned long prevSendMillis = 0;
unsigned long prevMillis = 0;

uint8_t vel = 35;
uint8_t acc = 0;
uint8_t brake = 0;
uint8_t battPercent = 95;
uint8_t battVol = 78;
uint16_t battCurr = 10000;
uint8_t battTemp = 35;

uint8_t message[8];

// See the following for generating UUIDs:
// https://www.uuidgenerator.net/

#define SERVICE_UUID "4fafc201-1fb5-459e-8fcc-c5c9c331914b"
#define CORE_CHARACTERISTIC_UUID 'beb5483e-36e1-4688-b7f5-ea07361b26a8'
#define STATUS_CHARACTERISTIC_UUID '5d2e6e74-31f0-445e-8088-827c53b71166'
#define LIGHTING_CHARACTERISTIC_UUID '825eef3b-e3d0-4ca6-bef7-6428b7260f35'

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
      BLECharacteristic::PROPERTY_READ |
          BLECharacteristic::PROPERTY_WRITE |
          BLECharacteristic::PROPERTY_NOTIFY |
          BLECharacteristic::PROPERTY_INDICATE);

  // https://www.bluetooth.com/specifications/gatt/viewer?attributeXmlFile=org.bluetooth.descriptor.gatt.client_characteristic_configuration.xml
  // Create a BLE Descriptor
  pCoreCharacteristic->addDescriptor(new BLE2902());

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

void loop()
{
  // notify changed value
  unsigned long currentMillis = millis();
  if (currentMillis - prevMillis > 100)
  {
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
    prevMillis = currentMillis;
  }
  //bluetooth stack will go into congestion, if too many packets are sent, in 6 hours test i was able to go as low as 3ms
  if (deviceConnected && currentMillis - prevSendMillis > 1000)
  {
    message[0] = vel;
    message[1] = acc;
    message[2] = brake;
    message[3] = battPercent;
    message[4] = battVol;
    message[5] = (uint8_t)(battCurr >> 8);
    message[6] = (uint8_t)(battCurr & 0x00FF);
    message[7] = battTemp;
    pCoreCharacteristic->setValue((uint8_t *)message, sizeof(message));
    pCoreCharacteristic->notify();
    Serial.print(message[5]);
    Serial.print(" | ");
    Serial.println(message[6]);
    prevSendMillis = currentMillis;
  }

  //Serial.println(combinedValue);
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
