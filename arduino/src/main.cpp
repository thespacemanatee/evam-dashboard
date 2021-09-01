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

   A connect handler associated with the server starts a background task that performs notification
   every couple of seconds.
*/
#include <EVAM.h>

/***************  CALLBACKS ***************/

/* Callback for connection and disconnection of server */
class ConnectionCallbacks : public BLEServerCallbacks
{
  void onConnect(BLEServer *pServer)
  {
    deviceConnected = true;
    Serial.println("Connected");
  };

  void onDisconnect(BLEServer *pServer)
  {
    deviceConnected = false;
    Serial.println("Disconnected");
  }
};

/* Callback for updated lighting data written from client */
class LightingUpdateCallback : public BLECharacteristicCallbacks
{
  void onWrite(BLECharacteristic *pCharacteristic)
  {
    uint8_t *valPtr = pCharacteristic->getData();

    if (pCharacteristic == pFrontLightingCharacteristic)
    {
      Serial.println("Setting front RGB...");
      setVehicleLights(frontLightingMessage, valPtr);
    }
    else if (pCharacteristic == pRearLightingCharacteristic)
    {
      Serial.println("Setting rear RGB...");
      setVehicleLights(rearLightingMessage, valPtr);
    }
    else if (pCharacteristic == pInteriorLightingCharacteristic)
    {
      Serial.println("Setting interior RGB...");
      setVehicleLights(interiorLightingMessage, valPtr);
    }
    else
    {
      Serial.println("No matching characteristic");
    }
  }
};

/**
 * @brief Sets the vehicle light data
 * @param [in] lightArr The light data to modify
 * @param [in] value The rgb value to be set
 */
void setVehicleLights(uint8_t *lightArr, uint8_t *value)
{
  //loop to set the individual bytes
  Serial.print("RGB set to: ");
  for (int i = 0; i < 3; i++)
  {
    lightArr[i] = *(value + i);
    Serial.print(lightArr[i]);
    Serial.print(" ");
  }
  Serial.println();
}

/*************** UPDATE DATA FROM CAR ***************/

/* Updates core data for the core characteristic. Will eventually use CANBus data*/
void updateCoreData()
{
  //for now is hardcoded data
  // uint16_t accTemp = analogRead(ACC_PIN);
  // uint8_t accFinal = accTemp / 34.00;
  // vel = accFinal;
  // acc = accFinal;
  // brake = accFinal;
  // vel = rand() % 50 + 50;
  // acc = rand() % 50 + 50;
  // brake = rand() % 50 + 0;
  if (vel < 100) {
    vel++;
  } else {
    vel = 0;
  }
  if (acc < 100) {
    acc++;
  } else {
    acc = 0;
  }
  if (brake > 1) {
    brake--;
  } else {
    brake = 100;
  }
}

/* Updates CAN Bus node status for the status characteristic. Will eventually use CANBus data */
void updateStatusData()
{
  ecu = 255;
  bms = 1;
  tps = 1;
  sas = 0;
  imu = 255;
  interior = 255;
  flw = 1;
  frw = 0;
  rlw = 0;
  rrw = 0;
  fll = 255;
  frl = 255;
  rll = 255;
  rrl = 255;
}

void updateBatteryData()
{
  uint16_t battPhysicalCurr = rand() % 100 + 5;
  battPercent = rand() % 10 + 75;
  battVolt = rand() % 5 + 75;
  battCurr = (battPhysicalCurr + 320) * 10;
  battTemp = rand() % 10 + 40;
}

/* Updates CANBus with new lighting data received through Bluetooth */
void updateLightingData()
{
  //TODO
}

/*************** SET CHARACTERISTICS TO NEW VALUES ***************/

/* Sets new data for core characteristic and notifies */
void setCoreCharacteristic()
{
  if (!(coreMessage[0] == vel && coreMessage[1] == acc && coreMessage[2] == brake) && deviceConnected)
  {

    coreMessage[0] = vel;
    coreMessage[1] = acc;
    coreMessage[2] = brake;
    pCoreCharacteristic->setValue((uint8_t *)coreMessage, sizeof(coreMessage));
    pCoreCharacteristic->notify();
  }
}

/* Sets new data for node status characteristic and notifies */
void setStatusCharacteristic()
{
  if (!(statusMessage[0] == ecu &&
        statusMessage[1] == bms &&
        statusMessage[2] == tps &&
        statusMessage[3] == sas &&
        statusMessage[4] == imu &&
        statusMessage[5] == interior &&
        statusMessage[6] == flw &&
        statusMessage[7] == frw &&
        statusMessage[8] == rlw &&
        statusMessage[9] == rrw &&
        statusMessage[10] == fll &&
        statusMessage[11] == frl &&
        statusMessage[12] == rll &&
        statusMessage[13] == rrl) &&
      deviceConnected)
  {
    statusMessage[0] = ecu;
    statusMessage[1] = bms;
    statusMessage[2] = tps;
    statusMessage[3] = sas;
    statusMessage[4] = imu;
    statusMessage[5] = interior;
    statusMessage[6] = flw;
    statusMessage[7] = frw;
    statusMessage[8] = rlw;
    statusMessage[9] = rrw;
    statusMessage[10] = fll;
    statusMessage[11] = frl;
    statusMessage[12] = rll;
    statusMessage[13] = rrl;
    pStatusCharacteristic->setValue((uint8_t *)statusMessage, sizeof(statusMessage));
    pStatusCharacteristic->notify();
  }
}

void setBatteryCharacteristic()
{
  uint8_t battCurr_1 = battCurr >> 8;
  uint8_t battCurr_2 = battCurr & 0x00FF;
  if (!(batteryMessage[0] == battPercent &&
        batteryMessage[1] == battVolt &&
        batteryMessage[2] == battCurr_1 &&
        batteryMessage[3] == battCurr_2 &&
        batteryMessage[4] == battTemp) &&
      deviceConnected)
  {
    batteryMessage[0] = battPercent;
    batteryMessage[1] = battVolt;
    batteryMessage[2] = battCurr_1;
    batteryMessage[3] = battCurr_2;
    batteryMessage[4] = battTemp;
    pBatteryCharacteristic->setValue((uint8_t *)batteryMessage, sizeof(batteryMessage));
    pBatteryCharacteristic->notify();
  }
}

/* Sets new data for lighting characteristic */
void setLightingCharacteristic()
{
  pFrontLightingCharacteristic->setValue((uint8_t *)frontLightingMessage, sizeof(frontLightingMessage));
  pRearLightingCharacteristic->setValue((uint8_t *)rearLightingMessage, sizeof(rearLightingMessage));
  pInteriorLightingCharacteristic->setValue((uint8_t *)interiorLightingMessage, sizeof(interiorLightingMessage));
}

//set up the BLE device
void setup()
{
  //set lights to max for debug
  frontLightingMessage[0] = 255;
  frontLightingMessage[1] = 255;
  frontLightingMessage[2] = 255;
  rearLightingMessage[0] = 255;
  rearLightingMessage[1] = 255;
  rearLightingMessage[2] = 255;
  interiorLightingMessage[0] = 255;
  interiorLightingMessage[1] = 255;
  interiorLightingMessage[2] = 255;

  Serial.begin(115200);

  /* CAN Setup */
  //TODO

  /* BLE Setup */

  // Create the BLE Device
  BLEDevice::init("EVAM");

  // Create the BLE Server
  pServer = BLEDevice::createServer();
  pServer->setCallbacks(new ConnectionCallbacks());

  // Create the BLE Service
  BLEService *pCoreService = pServer->createService(CORE_SERVICE_UUID);
  BLEService *pStatusService = pServer->createService(STATUS_SERVICE_UUID);
  BLEService *pLightingService = pServer->createService(LIGHTING_SERVICE_UUID);

  // Create BLE Characteristics
  pCoreCharacteristic = pCoreService->createCharacteristic(
      CORE_CHARACTERISTIC_UUID,
      BLECharacteristic::PROPERTY_READ | BLECharacteristic::PROPERTY_NOTIFY);

  pStatusCharacteristic = pStatusService->createCharacteristic(
      STATUS_CHARACTERISTIC_UUID,
      BLECharacteristic::PROPERTY_READ | BLECharacteristic::PROPERTY_NOTIFY);

  pBatteryCharacteristic = pStatusService->createCharacteristic(
      BATTERY_CHARACTERISTIC_UUID,
      BLECharacteristic::PROPERTY_READ | BLECharacteristic::PROPERTY_NOTIFY);

  pFrontLightingCharacteristic = pLightingService->createCharacteristic(
      FRONT_LIGHTING_CHARACTERISTIC_UUID,
      BLECharacteristic::PROPERTY_READ | BLECharacteristic::PROPERTY_WRITE);
  pRearLightingCharacteristic = pLightingService->createCharacteristic(
      REAR_LIGHTING_CHARACTERISTIC_UUID,
      BLECharacteristic::PROPERTY_READ | BLECharacteristic::PROPERTY_WRITE);
  pInteriorLightingCharacteristic = pLightingService->createCharacteristic(
      INTERIOR_LIGHTING_CHARACTERISTIC_UUID,
      BLECharacteristic::PROPERTY_READ | BLECharacteristic::PROPERTY_WRITE);

  lightingCallback = new LightingUpdateCallback();

  pFrontLightingCharacteristic->setCallbacks(lightingCallback);
  pRearLightingCharacteristic->setCallbacks(lightingCallback);
  pInteriorLightingCharacteristic->setCallbacks(lightingCallback);

  // Create BLE Descriptors
  pCoreCharacteristic->addDescriptor(new BLE2902());
  pStatusCharacteristic->addDescriptor(new BLE2902());
  pBatteryCharacteristic->addDescriptor(new BLE2902());
  pFrontLightingCharacteristic->addDescriptor(new BLE2902());
  pRearLightingCharacteristic->addDescriptor(new BLE2902());
  pInteriorLightingCharacteristic->addDescriptor(new BLE2902());

  // Start the service
  pCoreService->start();
  pStatusService->start();
  pLightingService->start();

  // Start advertising
  BLEAdvertising *pAdvertising = BLEDevice::getAdvertising();
  pAdvertising->addServiceUUID(CORE_SERVICE_UUID);
  pAdvertising->setScanResponse(false);
  pAdvertising->setMinPreferred(0x0); // set value to 0x00 to not advertise this parameter
  BLEDevice::startAdvertising();
  Serial.println("Waiting a client connection...");
}

void loop()
{
  unsigned long currentMillis = millis();
  //!!THIS CODE HAS NO OVERFLOW PROTECTION!!
  //(since the car isn't expected to remain on for 50 days consecutively)

  //update and notify for core data
  if (currentMillis - prevCoreMillis > CORE_DATA_REFRESH_INTERVAL)
  {
    updateCoreData();
    updateBatteryData();
    setCoreCharacteristic();
    setBatteryCharacteristic();
    prevCoreMillis = currentMillis;
  }

  //update and notify for additional low priority data (lighting)
  if (currentMillis - prevSlowMillis > SLOW_DATA_REFRESH_INTERVAL)
  {
    updateStatusData();
    setStatusCharacteristic();
    setLightingCharacteristic();
    prevSlowMillis = currentMillis;
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
