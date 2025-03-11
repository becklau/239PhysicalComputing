#include "Arduino_SensorKit.h"

void setup() {
  Serial.begin(9600);
  Environment.begin();
}

void loop() {
  float temperature = Environment.readTemperature();
  float humidity = Environment.readHumidity();

  // Send clean CSV data like: 23.5,45.6
  Serial.print(temperature);
  Serial.print(",");
  Serial.println(humidity);

  delay(1000);
}
