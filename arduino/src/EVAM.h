/* 
 * EVAM.h 
 */

#ifndef EVAM_H
#define EVAM_H

#define SERIAL_DEBUG    //flag to turn on/off Serial.print (not used for now)

#include <Arduino.h>
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>
#include <hud_ble.h>    //contains all the BLE related code
#include <hud_can.h>    //contains all the CAN Bus related code

//Connected pins
#define MOTOR_LOCK_PIN GPIO_NUM_23
#define LIGHTING_SWITCH_PIN GPIO_NUM_26
#define LIGHTING_LED_PIN GPIO_NUM_27
#define BUZZER_OUT_PIN GPIO_NUM_34
#define REVERSE_SWITCH_PIN GPIO_NUM_21
#define BOOST_SWITCH_PIN GPIO_NUM_3
#define NORMAL_DRIVE_SWITCH_PIN GPIO_NUM_1

//Timings

#define CORE_DATA_REFRESH_INTERVAL 16
#define SLOW_DATA_REFRESH_INTERVAL 100
#define MOTOR_LOCK_MSG_REFRESH_INTERVAL 1000
extern unsigned long prevCoreMillis; //timer for the important data service
extern unsigned long prevSlowMillis; //timer for the less important data service
extern unsigned long prevMotorLockMillis; //timer for the less important data service


/********** MESSAGES FOR BLE CHARACTERISTICS **********/

/* Core message to be notified 
    coreMessage[0] = vel    //Car velocity, 0-255km/h
    coreMessage[1] = acc    //Accelerator percentage, 0-100%
    coreMessage[2] = brake  //Brake percentage, 0-100%
*/
extern uint8_t coreMessage[3];

/* Node status message to be notified:
    statusMessage[0] = ecu          //engine control unit
    statusMessage[1] = bms          //battery management system
    statusMessage[2] = tps          //throttle (and brake) position sensor
    statusMessage[3] = sas          //steering angle sensor
    statusMessage[4] = imu          //inertial measurment unit
    statusMessage[5] = fw           //Front wheels
    statusMessage[6] = rlw          //Rear left wheel
    statusMessage[7] = rrw          //Rear right wheel
    statusMessage[8] = fl           //Front lights
    statusMessage[9] = rl           //Rear lights
    statusMessage[10] = interior    //interior lights
    0: error, 1: ok, 255: offline
*/
extern uint8_t statusMessage[11];


/* Battery status message to be notified 
    batteryMessage[0] =  battPercent    //Battery percentage
    batteryMessage[1] =  battVolt       //Battery voltage
    batteryMessage[2] =  battCurr_1     //Battery current part 1
    batteryMessage[3] =  battCurr_2     //Battery current part 2
    batteryMessage[4] =  battTemp       //Battery Temperature
*/
extern uint8_t batteryMessage[5];

/*  Lighting messages, removed
 *  Uses the lighting CAN message directly instead
 *  format: red, green, blue
 */
// uint8_t frontLightingMessage[3];
// uint8_t rearLightingMessage[3];
// uint8_t interiorLightingMessage[3];

/*  only for manually updating data (i.e. no canbus)
void updateCoreData();
void updateStatusData();
void updateBatteryData();
void setCoreCharacteristicOld();    //for use without CANBus
void setStatusCharacteristicOld();  //for use without CANBus
void setBatteryCharacteristicOld(); //for use without CANBus
*/

void setCoreCharacteristic();
void setStatusCharacteristic();
void setBatteryCharacteristic();
void checkMotorLockout();

//void setLightingCharacteristic();

/* For Debug */
#define ACC_PIN 34

#endif //EVAM_H