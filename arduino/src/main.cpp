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

/*  CALLBACKS */

//callback for connection and disconnection of server
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

//callback for updated lighting data written from client (phone)
class LightingUpdateCallback: public BLECharacteristicCallbacks 
{
  void onWrite(BLECharacteristic *pCharacteristic) {
    uint8_t* valPtr = pCharacteristic->getData();
    //do stuff with <value>
    //note that array size of 9 is hardcoded, because there doesn't seem to be a way to determine the length of data in <pCharacteristic>
    for (int i = 0; i < 9; i++){  //loop to set the individual bytes
      lightingMessage[i] = *(valPtr + i);
      Serial.print(lightingMessage[i]);  //debug
    }
    Serial.println();  //debug
  }
};

/*************** UPDATE DATA FROM CAR ***************/

/* Updates core data for the core characteristic. Will eventually use CANBus data*/
void updateCoreData()
{
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

/* Updates CAN Bus node status for the status characteristic. Will eventually use CANBus data */
void updateStatusData()
{
  //TODO
}

//not used
/* Updates lighting values for the status characteristic */
/*  
void updateLightingData()
{
  
}
*/

/*************** SET CHARACTERISTICS TO NEW VALUES ***************/

/* Sets new data for core characteristic and notifies */
void setCoreCharacteristic()
{
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

/* Sets new data for node characteristic and notifies */
void setStatusCharacteristic()
{
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

/* Sets new data for lighting characteristic */
void setLightingCharacteristic(){
  /*  //values are changed from the <LightingUpdateCallback> function
  lightingMessage[0] = frontR;
  lightingMessage[1] = frontG;
  lightingMessage[2] = frontB;
  lightingMessage[3] = rearR;
  lightingMessage[4] = rearG;
  lightingMessage[5] = rearB;
  lightingMessage[6] = intR;
  lightingMessage[7] = intG;
  lightingMessage[8] = intB;
  */
  pLightingCharacteristic->setValue((uint8_t *)lightingMessage, sizeof(lightingMessage));
}

void setup()
{
  Serial.begin(115200);

  // Create the BLE Device
  BLEDevice::init("EVAM");

  // Create the BLE Server
  pServer = BLEDevice::createServer();
  pServer->setCallbacks(new ConnectionCallbacks());

  // Create the BLE Service
  BLEService *pService = pServer->createService(SERVICE_UUID);

  // Create BLE Characteristics
  pCoreCharacteristic = pService->createCharacteristic(
      CORE_CHARACTERISTIC_UUID,
      BLECharacteristic::PROPERTY_READ | BLECharacteristic::PROPERTY_NOTIFY
      //| BLECharacteristic::PROPERTY_WRITE
      //| BLECharacteristic::PROPERTY_INDICATE
  );

  pStatusCharacteristic = pService->createCharacteristic(
      STATUS_CHARACTERISTIC_UUID,
      BLECharacteristic::PROPERTY_READ | BLECharacteristic::PROPERTY_NOTIFY
      //| BLECharacteristic::PROPERTY_WRITE
      //| BLECharacteristic::PROPERTY_INDICATE
  );

  pLightingCharacteristic = pService->createCharacteristic(
      LIGHTING_CHARACTERISTIC_UUID,
      BLECharacteristic::PROPERTY_READ | BLECharacteristic::PROPERTY_WRITE
      //| BLECharacteristic::PROPERTY_NOTIFY
      //| BLECharacteristic::PROPERTY_INDICATE
  );

  pLightingCharacteristic->setCallbacks(new LightingUpdateCallback());


  // Create BLE Descriptors
  pCoreDescriptor = new BLEDescriptor(BLEUUID((uint16_t)0x2900));
  pCoreDescriptor->setValue("Core Data");
  pStatusDescriptor = new BLEDescriptor(BLEUUID((uint16_t)0x2901));
  pStatusDescriptor->setValue("Status Data");
  pLightingDescriptor = new BLEDescriptor(BLEUUID((uint16_t)0x2902));
  pLightingDescriptor->setValue("Lighting Configuration");

  pCoreCharacteristic->addDescriptor(pCoreDescriptor);
  pStatusCharacteristic->addDescriptor(pStatusDescriptor);
  pLightingCharacteristic->addDescriptor(pLightingDescriptor);

  // Start the service
  pService->start();

  // Start advertising
  BLEAdvertising *pAdvertising = BLEDevice::getAdvertising();
  pAdvertising->addServiceUUID(SERVICE_UUID);
  pAdvertising->setScanResponse(false);
  pAdvertising->setMinPreferred(0x0); // set value to 0x00 to not advertise this parameter
  BLEDevice::startAdvertising();
  Serial.println("Waiting a client connection...");
}

void loop()
{
  unsigned long currentMillis = millis();
  //update and notify once every 100ms
  if (currentMillis - prevMillis > 100)
  {
    updateCoreData();
    updateStatusData();
    //updateLightingData(); //lighting data is updated using the callback function
    setCoreCharacteristic();
    setStatusCharacteristic();
    setLightingCharacteristic();
    prevMillis = currentMillis;
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
