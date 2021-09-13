/*
  HUD NODE FOR EVAM

    Video: https://www.youtube.com/watch?v=oCMOYS71NIU
    Based on Neil Kolban example for IDF: https://github.com/nkolban/esp32-snippets/blob/master/cpp_utils/tests/BLE%20Tests/SampleNotify.cpp
    Ported to Arduino ESP32 by Evandro Copercini
    updated by chegewara

   Create a BLE server that, once we receive a connection, will send periodic notifications.

   The design of creating the BLE server is:
   1. Create a BLE Server
   2. Create a BLE Service
   3. Create a BLE Characteristic on the Service
   4. Create a BLE Descriptor on the characteristic
   5. Start the service.
   6. Start advertising.
*/

#include <EVAM.h>
#include <utils.h>

/***************  INITIAL VALUES FOR MESSAGES ***************/


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
      setVehicleLights(valPtr, FRONT_LIGHT);
    }
    else if (pCharacteristic == pRearLightingCharacteristic)
    {
      Serial.println("Setting rear RGB...");
      setVehicleLights(valPtr, REAR_LIGHT);
    }
    else if (pCharacteristic == pInteriorLightingCharacteristic)
    {
      Serial.println("Setting interior RGB...");
      setVehicleLights(valPtr, INT_LIGHT);
    }
    else
    {
      Serial.println("No matching characteristic");
    }
  }
};

/**
 * @brief Sets the vehicle light data and updates CANBus
 * @param [in] value The rgb value to be set
 * @param [in] location which light to set (FRONT_LIGHT, REAR_LIGHT, INT_LIGHT)
 */
void setVehicleLights(uint8_t *value, uint8_t location)
{
  Serial.print("RGB set to: ");

  //loop to set the individual bytes
  uint8_t lightArr[3];
  for (int i = 0; i < 3; i++)
  {
    lightArr[i] = *(value + i);
    Serial.print(lightArr[i]);
    Serial.print(" ");
  }
  Serial.println();
  #ifdef CAN_CONNECTED
  switch (location){
    case FRONT_LIGHT:
      for(int i = 0; i < 3; i++){
        frontLightMsg.data[i] = lightArr[i];
      }
      mcp2515.sendMessage(&frontLightMsg);
      break;
    case REAR_LIGHT:
      for(int i = 0; i < 3; i++){
        rearLightMsg.data[i] = lightArr[i];
      }
      mcp2515.sendMessage(&rearLightMsg);
      break;
    case INT_LIGHT:
      for(int i = 0; i < 3; i++){
        intLightMsg.data[i] = lightArr[i];
      }
      mcp2515.sendMessage(&intLightMsg);
      break;
  } //switch
  #endif  //CAN_CONNECTED
}

#ifdef CAN_CONNECTED
/*************** INITIALISE MESSAGE CONTENTS ***************/

void initCoreMsg()
{
  for(int i = 0; i < sizeof(coreMessage); i++)
  {
    coreMessage[i] = 0;
  }
}

void initLightingMsg()
{
  //setup front light message for CAN Bus
  frontLightMsg.can_id  = 0x60;
  frontLightMsg.can_dlc = 5;
  frontLightMsg.data[0] = 0;
  frontLightMsg.data[1] = 0;
  frontLightMsg.data[2] = 0;
  frontLightMsg.data[3] = 0;
  frontLightMsg.data[4] = 0;

  //setup rear light message for CAN Bus
  rearLightMsg.can_id  = 0x61;
  rearLightMsg.can_dlc = 5;
  rearLightMsg.data[0] = 0;
  rearLightMsg.data[1] = 0;
  rearLightMsg.data[2] = 0;
  rearLightMsg.data[3] = 0;
  rearLightMsg.data[4] = 0;

  //setup interior light message for CAN Bus
  intLightMsg.can_id  = 0x62;
  intLightMsg.can_dlc = 5;
  intLightMsg.data[0] = 0;  
  intLightMsg.data[1] = 0;
  intLightMsg.data[2] = 0;
  intLightMsg.data[3] = 0;
  intLightMsg.data[4] = 0;
}

void initBattMsg() 
{
  for(int i = 0; i < sizeof(batteryMessage); i++)
  {
    batteryMessage[i] = 0;  //everything 0
  }
}

void initStatusMsg()
{
  for(int i = 0; i < sizeof(statusMessage); i++)
  {
    statusMessage[i] = 255; //all offline
  }
}

/*************** UPDATE DATA FROM CAN BUS***************/

/* Reads CAN Bus messages and updates the relevant data */
void readCAN(){
  if (mcp2515.readMessage(&canMsg) == MCP2515::ERROR_OK){ //message available

    /* Core & Battery data */
    if (canMsg.can_id == 0x08){ //ecu status
      statusMessage[0] = (canMsg.data[0]);
      setStatusCharacteristic();
    }
    else if (canMsg.can_id == 0x09){ //bms status
      statusMessage[1] = (canMsg.data[0]);
      setStatusCharacteristic();
    }
    else if (canMsg.can_id == 0x0A){ //tps status
      statusMessage[2] = (canMsg.data[0]);
      setStatusCharacteristic();
    }
    else if (canMsg.can_id == 0x0B){ //sas status
      statusMessage[3] = (canMsg.data[0]);
      setStatusCharacteristic();
    }
    else if (canMsg.can_id == 0x0C){ //imu status
      statusMessage[4] = (canMsg.data[0]);
      setStatusCharacteristic();
    }
    else if (canMsg.can_id == 0x0D){ //fw status
      statusMessage[5] = (canMsg.data[0]);
      setStatusCharacteristic();
    }
    else if (canMsg.can_id == 0x0F){ //rlw status
      statusMessage[6] = (canMsg.data[0]);
      setStatusCharacteristic();
    }
    else if (canMsg.can_id == 0x10){ //rrw status
      statusMessage[7] = (canMsg.data[0]);
      setStatusCharacteristic();
    }
    else if (canMsg.can_id == 0x11){ //fl status
      statusMessage[8] = (canMsg.data[0]);
      setStatusCharacteristic();
    }
    else if (canMsg.can_id == 0x12){ //rl status
      statusMessage[9] = (canMsg.data[0]);
      setStatusCharacteristic();
    }
    else if (canMsg.can_id == 0x13){ //int status
      statusMessage[10] = (canMsg.data[0]);
      setStatusCharacteristic();
    }

    /* Core & Battery data */
    else if (canMsg.can_id == 0x20){  //throttle n brake position
      coreMessage[1] = (canMsg.data[0])/4; //acc
      coreMessage[2] = (canMsg.data[1])/4;  //brake
    }
    else if (canMsg.can_id == 0x24){  //battery stats message
      float rawBattVolt = (canMsg.data[0] + (canMsg.data[1]<<8))*0.1;
      batteryMessage[1] = (int)rawBattVolt; //battVolt

      //float rawBattCurr = - 320 + (canMsg.data[2] + canMsg.data[3]<<8)*0.1;
      batteryMessage[2] = canMsg.data[2]; //battCurr_1
      batteryMessage[3] = canMsg.data[3]; //battCurr_2
      batteryMessage[0] = canMsg.data[6]; //battPercent
    }
    else if (canMsg.can_id == 0x38){  //Vehicle Speed message
      //vel = (canMsg.data[0] + (canMsg.data[1]<<8))/256; //16 bit precision
      coreMessage[0] = canMsg.data[1]; //vel; 8 bit precision
    }
  } //if message available
} //readCAN()

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

#else //CAN not connected
/*************** UPDATE WITH RANDOM DATA, FOR TESTING W/O CAN BUS ***************/

/* Manually update core data for the core characteristic. */
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

/* Manually update CAN Bus node status for the status characteristic. */
void updateStatusData()
{
  ecu = 255;
  bms = 1;
  tps = 1;
  sas = 0;
  imu = 255;
  fw = 1;
  rlw = 0;
  rrw = 0;
  fl = 255;
  rl = 255;
  interior = 0;
}

/* Manually update battery data for the battery characteristic. */
void updateBatteryData()
{
  float battPhysicalCurr = randomFloatRange(300);
  battPercent = randomFloatRange(100) * 10;
  battVolt = randomFloatRange(75) * 10;
  battCurr = (battPhysicalCurr + 320) * 10;
  battTemp = randomFloatRange(50) * 10;
}
#endif

/*************** SET CHARACTERISTICS TO NEW VALUES ***************/

#ifndef CAN_CONNECTED

void setCoreCharacteristicOld()
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

/* Sets new data for node status characteristic and notifies
 * Used only for  testing without the canbus 
 */
void setStatusCharacteristicOld()
{
  if (!(statusMessage[0] == ecu &&
        statusMessage[1] == bms &&
        statusMessage[2] == tps &&
        statusMessage[3] == sas &&
        statusMessage[4] == imu &&
        statusMessage[5] == fw &&
        statusMessage[6] == rlw &&
        statusMessage[7] == rrw &&
        statusMessage[8] == fl &&
        statusMessage[9] == rl &&
        statusMessage[10] == interior) &&
      deviceConnected)
  {
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
    pStatusCharacteristic->setValue((uint8_t *)statusMessage, sizeof(statusMessage));
    pStatusCharacteristic->notify();
  }
}

/* Sets new data for battery characteristic and notifies
 * Used only for  testing without the canbus 
 */
void setBatteryCharacteristicOld()
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
#else //CAN_CONNECTED

#endif

/*************** SETUP ***************/
void setup()
{
  #ifndef CAN_CONNECTED
  srand(static_cast<unsigned>(time(0)));  //to create the random data
  #endif

  Serial.begin(115200);
  Serial.println("EVAM HUD (Dashboard) Node");

  /* CAN Setup */
  #ifdef CAN_CONNECTED
  initCoreMsg();
  initLightingMsg();
  initBattMsg();
  initStatusMsg();
  
  //start CAN Bus
  SPI.begin();
  mcp2515.reset();
  mcp2515.setBitrate(CAN_500KBPS);
  mcp2515.setNormalMode();
  #endif  //CAN_CONNECTED

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
  Serial.println("Connect to bluetooth device: 'EVAM'.");

  setStatusCharacteristic();
}


/*************** MAIN LOOP ***************/
void loop()
{
  unsigned long currentMillis = millis();
  /*!!THIS CODE HAS NO OVERFLOW PROTECTION!!
   *(since the car isn't expected to remain on for 50 days consecutively)
   */

  #ifdef CAN_CONNECTED
  readCAN();
  #endif  //CAN_CONNECTED

  //update and notify for core data
  if (currentMillis - prevCoreMillis > CORE_DATA_REFRESH_INTERVAL)
  {
    #ifndef CAN_CONNECTED
    updateCoreData();
    updateBatteryData();
    setCoreCharacteristicOld();
    setBatteryCharacteristicOld();
    #else //CAN_CONNECTED
    setBatteryCharacteristic();
    setCoreCharacteristic();
    #endif
    prevCoreMillis = currentMillis;
  }

  //update and notify for additional low priority data (status)
  if (currentMillis - prevSlowMillis > SLOW_DATA_REFRESH_INTERVAL)
  {
    #ifndef CAN_CONNECTED //if CANbus is connected, characteristic is updated whenever the data comes in
    updateStatusData();
    setStatusCharacteristicOld();
    #endif  
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
