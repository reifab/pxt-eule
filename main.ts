eule.initLightSensor(AvailablePinsOfLightSensor.P0)
eule.initServo(AvailablePinsOfServo.P1)
eule.mountingPosition()
basic.pause(10000)
eule.setServoPositionsManually(
0,
60,
120,
180
)
eule.calibrateServoPositions()
basic.forever(function () {
    eule.setServoPosition(ServoPosition.RED)
    serial.writeValue("rot", eule.getBrightness(0))
    eule.setServoPosition(ServoPosition.GREEN)
    serial.writeValue("grün", eule.getBrightness(0))
    eule.setServoPosition(ServoPosition.BLUE)
    serial.writeValue("blau", eule.getBrightness(0))
})
