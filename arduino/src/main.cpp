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
    
    if(pCharacteristic == pFrontLightingCharacteristic){
      for (int i = 0; i < 3; i++)
      { //loop to set the individual bytes
        frontLightingMessage[i] = *(valPtr + i);
        Serial.print(frontLightingMessage[i]); //debug
      }
      Serial.println(); //debug
    }
    else if(pCharacteristic == pRearLightingCharacteristic){
      for (int i = 0; i < 3; i++)
      { //loop to set the individual bytes
        rearLightingMessage[i] = *(valPtr + i);
        Serial.print(rearLightingMessage[i]); //debug
      }
      Serial.println(); //debug
    }
    else if(pCharacteristic == pInteriorLightingCharacteristic){
      for (int i = 0; i < 3; i++)
      { //loop to set the individual bytes
        interiorLightingMessage[i] = *(valPtr + i);
        Serial.print(interiorLightingMessage[i]); //debug
      }
      Serial.println(); //debug
    }
    else{
      Serial.println("No mathcing characteristic");
    }
  }
};

/*************** UPDATE DATA FROM CAR ***************/

/* Updates core data for the core characteristic. Will eventually use CANBus data*/
void updateCoreData()
{
  //for now is hardcoded data

  //vel = rand() % 50 + 50;
  vel = acc;
  brake = rand() % 50;
  //acc = rand() % 50 + 50;
  uint16_t accTemp = analogRead(ACC_PIN);
  acc = (uint8_t)(float(accTemp)/34.00);
  Serial.print(acc);
  Serial.print(" | ");
  Serial.println(accTemp);
  battPercent = rand() % 10 + 75;
  battVolt = rand() % 5 + 75;
  uint16_t battPhysicalCurr = rand() % 100 + 5;
  battCurr = (battPhysicalCurr + 320) * 10 ;
  battTemp = rand() % 10 + 40;
}

/* Updates CAN Bus node status for the status characteristic. Will eventually use CANBus data */
void updateStatusData()
{
  //TODO
}


/* Updates CANBus with new lighting data received through Bluetooth */
void updateLights()
{
  //TODO
}


/*************** SET CHARACTERISTICS TO NEW VALUES ***************/

/* Sets new data for core characteristic and notifies */
void setCoreCharacteristic()
{
  coreMessage[0] = vel;
  coreMessage[1] = acc;
  coreMessage[2] = brake;
  coreMessage[3] = battPercent;
  coreMessage[4] = battVolt;
  coreMessage[5] = (uint8_t)(battCurr >> 8);
  coreMessage[6] = (uint8_t)(battCurr & 0x00FF);
  coreMessage[7] = battTemp;
  pCoreCharacteristic->setValue((uint8_t *)coreMessage, sizeof(coreMessage));
  pCoreCharacteristic->notify();
}

/* Sets new data for node status characteristic and notifies */
void setStatusCharacteristic()
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
      BLECharacteristic::PROPERTY_READ | BLECharacteristic::PROPERTY_NOTIFY
      //| BLECharacteristic::PROPERTY_WRITE
      //| BLECharacteristic::PROPERTY_INDICATE
  );

  pStatusCharacteristic = pStatusService->createCharacteristic(
      STATUS_CHARACTERISTIC_UUID,
      BLECharacteristic::PROPERTY_READ | BLECharacteristic::PROPERTY_NOTIFY
      //| BLECharacteristic::PROPERTY_WRITE
      //| BLECharacteristic::PROPERTY_INDICATE
  );

  pFrontLightingCharacteristic = pLightingService->createCharacteristic(
      FRONT_LIGHTING_CHARACTERISTIC_UUID,
      BLECharacteristic::PROPERTY_READ | BLECharacteristic::PROPERTY_WRITE
      //| BLECharacteristic::PROPERTY_NOTIFY
      //| BLECharacteristic::PROPERTY_INDICATE
  );
  pRearLightingCharacteristic = pLightingService->createCharacteristic(
      REAR_LIGHTING_CHARACTERISTIC_UUID,
      BLECharacteristic::PROPERTY_READ | BLECharacteristic::PROPERTY_WRITE
      //| BLECharacteristic::PROPERTY_NOTIFY
      //| BLECharacteristic::PROPERTY_INDICATE
  );
  pInteriorLightingCharacteristic = pLightingService->createCharacteristic(
      INTERIOR_LIGHTING_CHARACTERISTIC_UUID,
      BLECharacteristic::PROPERTY_READ | BLECharacteristic::PROPERTY_WRITE
      //| BLECharacteristic::PROPERTY_NOTIFY
      //| BLECharacteristic::PROPERTY_INDICATE
  );
  pFrontLightingCharacteristic->setCallbacks(new LightingUpdateCallback());
  pRearLightingCharacteristic->setCallbacks(new LightingUpdateCallback());
  pInteriorLightingCharacteristic->setCallbacks(new LightingUpdateCallback());

  // Create BLE Descriptors
  pDescriptor = new BLE2902();
  /*
  pStatusDescriptor = new BLE2902();
  pFrontLDescriptor = new BLE2902();
  pRearLDescriptor = new BLE2902();
  pInteriorLDescriptor = new BLE2902();  
  */

  pCoreCharacteristic->addDescriptor(pDescriptor);
  pStatusCharacteristic->addDescriptor(pDescriptor);
  pFrontLightingCharacteristic->addDescriptor(pDescriptor);
  pRearLightingCharacteristic->addDescriptor(pDescriptor);
  pInteriorLightingCharacteristic->addDescriptor(pDescriptor);

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
    updateStatusData();
    setCoreCharacteristic();
    setStatusCharacteristic();
    prevCoreMillis = currentMillis;
  }

  //update and notify for additional low priority data (lighting)
  if (currentMillis - prevSlowMillis > SLOW_DATA_REFRESH_INTERVAL)
  {
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
