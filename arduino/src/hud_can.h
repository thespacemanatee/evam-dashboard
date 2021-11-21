#ifndef HUD_CAN_H
#define HUD_CAN_H

#include <ESP32CAN.h>
#include <CAN_config.h>
#include <arduino.h>
#include <can_ids.h>
#include <EVAM.h>

//CAN Messages
extern CAN_frame_t frontLightMsg;  //front light CAN message
extern CAN_frame_t rearLightMsg;   //rear light CAN message
extern CAN_frame_t intLightMsg;    //interior light CAN message
extern CAN_frame_t motorLockMsg;    //motor lock status

void canSetup();

void checkCanMessages();

void initCoreMsg();
void initLightingMsg();
void initBattMsg();
void initStatusMsg();
void initMotorLockMsg();


//used for setVehicleLights
enum lightLocation_t{
    FRONT_LIGHT = 1,
    REAR_LIGHT  = 2,
    INT_LIGHT   = 3
};
void setVehicleLights(uint8_t *value, lightLocation_t location); //updates the CANBus on the new light data



#endif