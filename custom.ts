/**
 * Nutze diese Datei für benutzerdefinierte Funktionen und Blöcke.
 * Weitere Informationen unter https://makecode.microbit.org/blocks/custom
 */

enum AvailablePinsOfLightSensor {
    //% block="P0"
    P0 = 0,
    //% block="P1"
    P1 = 1,
}

enum AvailablePinsOfServo {
    //% block="P2"
    P2 = 2,
    //% block="P3"
    P3 = 3,
}

enum ServoPosition {
    //% block="roten"
    RED = 0,
    //% block="grünen"
    GREEN = 1,
    //% block="blauen"
    BLUE = 2,
     //% block="gelben"
    YELLOW = 3,
}

/**
 * Benutzerdefinierte Blöcke
 */
//% weight=100 color=#993300 icon="\uf06e"
namespace eule {
    let selectedPinForLightSensor: AnalogPin = null
    let selectedPinForServo: AnalogPin = null
    let maxReachedSensorValue: number = 600 // 1023 werden nicht erreicht mit diesem Sensor
    let angleRed: number = 0
    let angleGreen: number = 45
    let angleBlue: number = 100
    let angleYellow: number = 160

    /**
     * Macht den Lichtsensor startklar
     * @param pin Pin, wo der Lichtsensor angeschlossen ist.
     */
    //% group="beim Start"
    //% block="Lichtsensor ist an Port %pin angeschlossen"
    export function initLightSensor(pin?: AvailablePinsOfLightSensor): void {
        switch(pin){
            case AvailablePinsOfLightSensor.P0:{
                selectedPinForLightSensor = AnalogPin.P0
                break
            }
            case AvailablePinsOfLightSensor.P1:{
                selectedPinForLightSensor = AnalogPin.P1
                break
            }
        }
    }

    /**
     * Macht den Servo startklar
     * @param pin Pin, wo der Servo angeschlossen ist.
     */
    //% block="Servo ist an Port %pin angeschlossen"
    //% group="beim Start"
    export function initServo(pin?: AvailablePinsOfServo): void {
        switch(pin){
            case AvailablePinsOfServo.P2:{
                selectedPinForServo = AnalogPin.P2
                break
            }
            case AvailablePinsOfServo.P3:{
                selectedPinForServo = AnalogPin.P3
                break
            }
        }
    }

    /**
     * Gibt die Helligkeit des Lichtsensors zurück.
     * Rückgabewert ist eine Zahl von 0 (kein Licht) bis 255 (viel Licht).
     * @param schwellwert Lichtintensität, ab der Werte gelesen werden.
     */
    //% schwellwert.min=0 schwellwert.max=50 schwellwert.defl=10
    //% block="lese Helligkeit ab Schwellwert %schwellwert"
    //% group="Lichtsensor"
    export function getBrightness(schwellwert?: number): number {
        let lightIntensity: number = 0
        const minSensorValue: number = 0
        const minOutputValue: number = 0
        const maxOutputValue: number = 255
        
        if(selectedPinForLightSensor != null){
            lightIntensity = pins.analogReadPin(selectedPinForLightSensor)
            lightIntensity = pins.map(lightIntensity, minSensorValue, maxReachedSensorValue, minOutputValue, maxOutputValue)
            lightIntensity = Math.round(lightIntensity)
            if(lightIntensity >= schwellwert){
                if(lightIntensity>=maxOutputValue){
                    lightIntensity = maxOutputValue
                }
            }else{
                lightIntensity = 0
            }
        }
        return lightIntensity;
        // Add code here
    }

    function setServoAngle(angle?: number){
        pins.servoWritePin(selectedPinForServo,angle)
    }

    function findLocalMax(angleStart?: number){
        let y: number = 0
        let x: number = angleStart
        let x_localMax: number = 0
        let y_before: number = 0
        const dx: number = 1
        const xmax: number = 190
        const threshold: number = 20
        let doLoop: boolean = true

        while((x < xmax) && doLoop){
            setServoAngle(x)
            basic.pause(50)
            y = pins.analogReadPin(selectedPinForLightSensor)
            x = x + dx
            if(y > y_before){
                x_localMax = x
                if(y > (y_before + threshold)){
                    y_before = y
                }       
            }

            if((y+threshold) < y_before){
                doLoop = false
                y_before = y
            }   
        }
        return x_localMax
    }

    function findLocalMin(angleStart?: number){
        let y: number = 0
        let x: number = angleStart
        let x_localMin: number = 0
        let y_before: number = 1023
        const dx: number = 1
        const xmax: number = 180
        const threshold: number = 20
        let doLoop: boolean = true

        while((x < xmax) && doLoop){
            setServoAngle(x)
            basic.pause(50)
            y = pins.analogReadPin(selectedPinForLightSensor)
            x = x + dx
            if(y < y_before){
                x_localMin = x
                if(y < (y_before-threshold)){
                    y_before = y
                }
            }
            if((y-threshold) > y_before){
                doLoop = false
                y_before = y
            }   
        }
        return x_localMin
    }

    /**
     * Kalibriert die Servopositionen, sodass sich die Farbfilter korrekt über dem Sensor befinden.
     */
    //% block="kalibriere Servopositionen"
    //% group="beim Start"
    export function calibrateServoPositions(): void {
        eule.mountingPosition()
        basic.pause(1000)
        serial.writeLine("Kalibrierung wird gestartet...")
        serial.writeLine("Kalibrierte Werte:")
        let angle: number

        angleRed = findLocalMax(0)
        angle = findLocalMin(angleRed)
        serial.writeValue("kalibrierter Winkel rot", angleRed)
       
        angleGreen = findLocalMax(angle)
        angle = findLocalMin(angleGreen)
        serial.writeValue("kalibrierter Winkel grün", angleGreen)
        
        angleBlue = findLocalMax(angle)
        angle = findLocalMin(angleBlue)
        serial.writeValue("kalibrierter Winkel blau", angleBlue)

        angleYellow = findLocalMax(angle)
        serial.writeValue("kalibrierter Winkel gelb", angleYellow)
        
    }

     /**
     * Bringt den Servo in Montageposition
     * In dieser Position muss der rote Farbfilter über dem Loch liegen.
     */
    //% block="bringe Servo in Montageposition"
    //% group="Montage"
    export function mountingPosition(): void {
        setServoAngle(0)
    }

    /**
     * Stellt den Servo auf die gewünschte Position
     * @param pos Position, die der Servo einstellen soll.
     */
    //% block="Eule schaut durch %Position Filter"
    //% group="Servo"
    export function setServoPosition(pos?: ServoPosition): void {
        switch(pos){
            case ServoPosition.RED:{
                setServoAngle(angleRed)
                break;
            }
            case ServoPosition.GREEN:{
                setServoAngle(angleGreen)
                break;
            }
            case ServoPosition.BLUE:{
                setServoAngle(angleBlue)
                break;
            }
            case ServoPosition.YELLOW:{
                setServoAngle(angleYellow)
                break;
            }
        }
        basic.pause(1000)
    }
}