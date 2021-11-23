/*
 * HUD NODE FOR EVAM

    Based on Neil Kolban example for IDF: https://github.com/nkolban/esp32-snippets/blob/master/cpp_utils/tests/BLE%20Tests/SampleNotify.cpp
    Ported to Arduino ESP32 by Evandro Copercini
    updated by chegewara

 *  !!THIS CODE HAS NO OVERFLOW PROTECTION!!
 *  (since the car isn't expected to remain on for 50 days consecutively)
 * 
 * TODO:  ECO/BOOST not enabled (probably not enabling)
 *        Test
 *
 */

#include <EVAM.h>
//#include <utils.h>

/*************** CALLBACKS ***************/

/* Callback for connection and disconnection of server */
class ConnectionCallbacks : public BLEServerCallbacks
{
  void onConnect(BLEServer *pServer)
  {
    deviceConnected = true;

    #ifdef SERIAL_DEBUG
    Serial.println("Connected");
    #endif
    
    phoneConnectedMsg.data.u8[0]=deviceConnected;
    ESP32Can.CANWriteFrame(&phoneConnectedMsg);
  };

  void onDisconnect(BLEServer *pServer)
  {
    deviceConnected = false;

    #ifdef SERIAL_DEBUG
    Serial.println("Disconnected");
    #endif

    phoneConnectedMsg.data.u8[0]=deviceConnected;
    ESP32Can.CANWriteFrame(&phoneConnectedMsg);
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


/*************** SETUP ***************/
void setup()
{
  /*
  #ifndef CAN_CONNECTED
  srand(static_cast<unsigned>(time(0)));  //to create the random data
  #endif
  */

  Serial.begin(115200);
  Serial.println("EVAM HUD (Dashboard) Node");

  /* CAN Setup */
  int res = canSetup();

  #ifdef SERIAL_DEBUG
  if(res == 0){
    Serial.println("CAN Set Up Successful");
  }
  else{
    Serial.println("CAN Set Up Failed!");
  }
  #endif


  /* Message Set up */
  initMessageData();


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

  /* GPIO SETUP */
  setSwitchesGPIO();  
  attachInterrupts();
  lightSwitchOn = checkLightSwitch();
  #ifdef SERIAL_DEBUG
  Serial.print("Lights: ");
  Serial.println(lightSwitchOn);
  #endif
}


/*************** MAIN LOOP ***************/
void loop()
{
  unsigned long currentMillis = millis();

  sendButtonCanMessages();
  checkIncomingCanMessages(); 

  checkReEnableInterrupts(&currentMillis);


  //update BLE server and notify for core data
  if (currentMillis - prevCoreMillis > CORE_DATA_REFRESH_INTERVAL)
  { 
    setBatteryCharacteristic();
    setCoreCharacteristic();
    prevCoreMillis = currentMillis;
  }

  //update and notify for additional low priority data
  if (currentMillis - prevSlowMillis > SLOW_DATA_REFRESH_INTERVAL)
  {
    /* if CANbus is connected, characteristic is updated whenever the data comes in
    updateStatusData();
    setStatusCharacteristicOld();
    */  
    prevSlowMillis = currentMillis;
  }

    //update and notify for additional low priority data
  if (currentMillis - prevMotorLockMillis > MOTOR_LOCK_MSG_REFRESH_INTERVAL)
  {
    checkSendMotorLockout();
    prevMotorLockMillis = currentMillis;
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


/*  UPDATE WITH RANDOM DATA, FOR TESTING W/O CAN BUS

// Manually update core data for the core characteristic. 
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
// Manually update CAN Bus node status for the status characteristic. 

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

// Manually update battery data for the battery characteristic.
void updateBatteryData()
{
  float battPhysicalCurr = randomFloatRange(300);
  battPercent = randomFloatRange(100) * 10;
  battVolt = randomFloatRange(75) * 10;
  battCurr = (battPhysicalCurr + 320) * 10;
  battTemp = randomFloatRange(50) * 10;
}
*/
/*************** SET CHARACTERISTICS TO NEW VALUES ***************/

/*
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
*/

/* Sets new data for node status characteristic and notifies
 * Used only for  testing without the canbus 
 */
/*
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
*/

/* Sets new data for battery characteristic and notifies
 * Used only for  testing without the canbus 
 */
/*
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
*/