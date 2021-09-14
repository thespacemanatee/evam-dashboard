

unsigned long lastHallMillis = 0;
unsigned long interval = 0;
float rpm = 0.0;
unsigned long lastPrintMillis = 0;
#define PRINT_INTERVAL 300
uint8_t buttonState = 0;

// constants won't change. They're used here to set pin numbers:
const int buttonPin = 2;     // the number of the pushbutton pin


void setup() {
  // initialize the pushbutton pin as an input:
  pinMode(buttonPin, INPUT);
  Serial.begin(115200);
}

void loop() {
  // read the state of the pushbutton value:
  buttonState = digitalRead(buttonPin);

  // check if the pushbutton is pressed. If it is, the buttonState is HIGH:
  if (buttonState == LOW) {

    interval = millis() - lastHallMillis;
    lastHallMillis = millis();
    Serial.print("Pulse Detected! Millis: ");
    Serial.println(lastHallMillis);
    rpm  = 60000.0/(float)interval;    
  }
  if (millis() - lastPrintMillis > PRINT_INTERVAL){
    //Serial.print("RPM: ");
    //Serial.println(rpm);
    //Serial.print("Interval: ");
    //Serial.println(interval);
  }
}
