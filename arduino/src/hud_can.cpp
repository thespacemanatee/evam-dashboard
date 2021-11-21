#include <hud_can.h>

CAN_device_t CAN_cfg;               // CAN Config
const int rx_queue_size = 10;       // Receive Queue size

CAN_frame_t frontLightMsg;  //front light CAN message
CAN_frame_t rearLightMsg;   //rear light CAN message
CAN_frame_t intLightMsg;    //interior light CAN message
CAN_frame_t motorLockMsg;    //motor lock status

//Sets up CAN Bus
//to be run in the Arduino setup function
void canSetup(){ 
  initCoreMsg();
  initLightingMsg();
  initBattMsg();
  initStatusMsg();
  initMotorLockMsg();
  CAN_cfg.speed = CAN_SPEED_500KBPS;
  CAN_cfg.tx_pin_id = GPIO_NUM_5;
  CAN_cfg.rx_pin_id = GPIO_NUM_14;
  CAN_cfg.rx_queue = xQueueCreate(rx_queue_size, sizeof(CAN_frame_t));
  // Init CAN Module
  ESP32Can.CANInit();
}

/*************** INITIALISE MESSAGE CONTENTS ***************/

void initCoreMsg()
{
  for(int i = 0; i < sizeof(coreMessage); i++)
  {
    coreMessage[i] = 0;
  }
}

void initLightingMsg(){
  //setup front light message for CAN Bus
  frontLightMsg.FIR.B.FF = CAN_frame_std;
  frontLightMsg.MsgID  = FRONT_LIGHT_MSG_ID;
  frontLightMsg.FIR.B.DLC = 5;
  for(uint8_t i = 0; i < 5; i++){
    frontLightMsg.data.u8[i] = 0;
  }
  
  //setup rear light message for CAN Bus
  rearLightMsg.FIR.B.FF = CAN_frame_std;
  rearLightMsg.MsgID  = REAR_LIGHT_MSG_ID;
  rearLightMsg.FIR.B.DLC = 5;
  for(uint8_t i = 0; i < 5; i++){
    rearLightMsg.data.u8[i] = 0;
  }

  //setup interior light message for CAN Bus
  intLightMsg.MsgID  = INT_LIGHT_MSG_ID;
  intLightMsg.MsgID  = INT_LIGHT_MSG_ID;
  intLightMsg.FIR.B.DLC = 5;
  for(uint8_t i = 0; i < 5; i++){
    intLightMsg.data.u8[i] = 0;
  }
}

void initBattMsg() {
  for(int i = 0; i < sizeof(batteryMessage); i++)
  {
    batteryMessage[i] = 0;  //everything 0
  }
}

void initStatusMsg(){
  for(int i = 0; i < sizeof(statusMessage); i++)
  {
    statusMessage[i] = 255; //all offline
  }
}

void initMotorLockMsg(){
  //setup front light message for CAN Bus
  motorLockMsg.FIR.B.FF = CAN_frame_std;
  motorLockMsg.MsgID  = MOTOR_LOCKOUT_MSG_ID;
  motorLockMsg.FIR.B.DLC = 1;
  motorLockMsg.data.u8[0] = 1;
}

/*************** UPDATE DATA FROM CAN BUS***************/

//checks for can messages and updates ESP's records of the data
//(or updates the BLE server immediately, in the case of the node statuses)
void checkCanMessages(){
  CAN_frame_t rx_frame;

  if (xQueueReceive(CAN_cfg.rx_queue, &rx_frame, 3 * portTICK_PERIOD_MS) == pdTRUE) {

    //check status messages
    if(rx_frame.MsgID == ECU_STATUS_MSG_ID){
      statusMessage[0] = (rx_frame.data.u8[0]);
      setStatusCharacteristic();
    }
    else if(rx_frame.MsgID == BMS_STATUS_MSG_ID){
      statusMessage[1] = (rx_frame.data.u8[0]);
      setStatusCharacteristic();
    }
    else if(rx_frame.MsgID == TPS_STATUS_MSG_ID){
      statusMessage[2] = (rx_frame.data.u8[0]);
      setStatusCharacteristic();
    }
    else if(rx_frame.MsgID == SAS_STATUS_MSG_ID){
      statusMessage[3] = (rx_frame.data.u8[0]);
      setStatusCharacteristic();
    }
    else if(rx_frame.MsgID == IMU_STATUS_MSG_ID){
      statusMessage[4] = (rx_frame.data.u8[0]);
      setStatusCharacteristic();
    }
    else if(rx_frame.MsgID == FW_STATUS_MSG_ID){
      statusMessage[5] = (rx_frame.data.u8[0]);
      setStatusCharacteristic();
    }
    else if(rx_frame.MsgID == RLW_STATUS_MSG_ID){
      statusMessage[6] = (rx_frame.data.u8[0]);
      setStatusCharacteristic();
    }
    else if(rx_frame.MsgID == RRW_STATUS_MSG_ID){
      statusMessage[7] = (rx_frame.data.u8[0]);
      setStatusCharacteristic();
    }
    else if(rx_frame.MsgID == FL_STATUS_MSG_ID){
      statusMessage[8] = (rx_frame.data.u8[0]);
      setStatusCharacteristic();
    }
    else if(rx_frame.MsgID == RL_STATUS_MSG_ID){
      statusMessage[9] = (rx_frame.data.u8[0]);
      setStatusCharacteristic();
    }
    else if(rx_frame.MsgID == INT_STATUS_MSG_ID){
      statusMessage[10] = (rx_frame.data.u8[0]);
      setStatusCharacteristic();
    }

    //check Core Data
    else if(rx_frame.MsgID == THROTTLE_BRAKE_MSG_ID){
      coreMessage[1] = uint8_t((rx_frame.data.u8[0] * 0.4)); //ew, float calculations
      coreMessage[2] = uint8_t((rx_frame.data.u8[4] * 0.4)); //ew, float calculations
    }
    else if(rx_frame.MsgID == BATT_STATS_MSG_ID){
        float battVolt_f = (rx_frame.data.u8[0] + (rx_frame.data.u8[1]<<8))*0.1;
        batteryMessage[1] = (uint8_t)battVolt_f; //battVolt

        //float rawBattCurr = - 320 + (canMsg.data[2] + canMsg.data[3]<<8)*0.1; //the 2 bits are directly passed to the ble server now
        batteryMessage[2] = rx_frame.data.u8[2]; //battCurr_1
        batteryMessage[3] = rx_frame.data.u8[3]; //battCurr_2
        batteryMessage[0] = rx_frame.data.u8[6]; //battPercent
    } 
    else if(rx_frame.MsgID == VEH_SPEED_MSG_ID){
      coreMessage[0] = rx_frame.data.u8[1]; //just take the second byte (MSB) since we only need 8-bit resolution
    }

    //check other data if required
  } //if(xQueueReceive...
}



/**
 * @brief Sets the vehicle light data and updates CANBus
 * @param [in] value The rgb value to be set
 * @param [in] location which light to set (FRONT_LIGHT, REAR_LIGHT, INT_LIGHT)
 */
void setVehicleLights(uint8_t *value, lightLocation_t location)
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
  switch (location){
    case FRONT_LIGHT:
      for(int i = 0; i < 3; i++){
        frontLightMsg.data.u8[i] = lightArr[i];
      }
      ESP32Can.CANWriteFrame(&frontLightMsg);
      break;
    case REAR_LIGHT:
      for(int i = 0; i < 3; i++){
        rearLightMsg.data.u8[i] = lightArr[i];
      }
      ESP32Can.CANWriteFrame(&rearLightMsg);
      break;
    case INT_LIGHT:
      for(int i = 0; i < 3; i++){
        intLightMsg.data.u8[i] = lightArr[i];
      }
      ESP32Can.CANWriteFrame(&intLightMsg);
      break;
  } //switch
}

