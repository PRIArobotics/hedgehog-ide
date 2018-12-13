'use strict';

goog.provide('Blockly.Msg.de.hedgehog');

goog.require('Blockly.Msg');

// <default GSL customizable: module-extras />

Blockly.Msg.HEDGEHOG_SCOPE = "Hedgehog scope %1 %2";
Blockly.Msg.HEDGEHOG_SCOPE_TOOLTIP = "Alle Hedgehog Blöcke müssen sich innerhalb eines Hedgehog scope Blocks befinden";

Blockly.Msg.HEDGEHOG_MOVE = "bewege Motor %1 %2 für %3 Sekunden";
Blockly.Msg.HEDGEHOG_MOVE_TOOLTIP = "Bewegt einen Motor in eine bestimmte Richtung";

Blockly.Msg.HEDGEHOG_MOVE_UNLIMITED = "bewege Motor %1 %2";
Blockly.Msg.HEDGEHOG_MOVE_UNLIMITED_TOOLTIP = "bewegt einen Motor solange bis er explizit gestoppt wird";

Blockly.Msg.HEDGEHOG_MOVE2 = "bewege Motor %1 und %2 mit Geschwindigkeit %3 und %4 für %5 Sekunden";
Blockly.Msg.HEDGEHOG_MOVE2_TOOLTIP = "Bewegt zwei Motor in eine bestimmte Richtung";

Blockly.Msg.HEDGEHOG_MOVE2_UNLIMITED = "bewege Motor %1 und %2 mit Geschwindigkeit %3 und %4";
Blockly.Msg.HEDGEHOG_MOVE2_UNLIMITED_TOOLTIP = "bewegt zwei Motoren solange bis sie explizit gestoppt werden";

Blockly.Msg.HEDGEHOG_FORWARD = "bewege Motor %1 und %2 %3 für %4 Sekunden";
Blockly.Msg.HEDGEHOG_FORWARD_TOOLTIP = "Bewegt zwei Motoren in eine bestimmte Richtung";

Blockly.Msg.HEDGEHOG_TURN = "wende mit Motor %1 und %2 %3 für %4 Sekunden";
Blockly.Msg.HEDGEHOG_TURN_TOOLTIP = "wendet den Hedgehog indem zwei Motoren in entgegengesetzter Richtung laufen gelassen werden";

Blockly.Msg.HEDGEHOG_SERVO = "setze Servo %1 auf %2 Grad";
Blockly.Msg.HEDGEHOG_SERVO_TOOLTIP = "verändert die position eines Servos";

Blockly.Msg.HEDGEHOG_PULLUP = "Port %1 pullup %2";
Blockly.Msg.HEDGEHOG_PULLUP_TOOLTIP = "Setze einen Pullup Widerstand für einen bestimmten IO Port";

Blockly.Msg.HEDGEHOG_READ_ANALOG = "analoger Port %1";
Blockly.Msg.HEDGEHOG_READ_ANALOG_TOOLTIP = "gibt den Wert eines analogen Ports zurück";

Blockly.Msg.HEDGEHOG_READ_DIGITAL = "digitaler Port %1";
Blockly.Msg.HEDGEHOG_READ_DIGITAL_TOOLTIP = "gibt den Wert eines analogen Ports zurück";

Blockly.Msg.HEDGEHOG_SLEEP = "pausiere für %1 Sekunden";
Blockly.Msg.HEDGEHOG_SLEEP_TOOLTIP = "pausiert den Programmablauf für eine spezifische Zeit";

Blockly.Msg.HEDGEHOG_CREATE_SCOPE = "iRobot Create scope %1 %2";
Blockly.Msg.HEDGEHOG_CREATE_SCOPE_TOOLTIP = "Alle Create Blöcke müssen sich innerhalb eines Create oder Create2 scope Blocks befinden";

Blockly.Msg.HEDGEHOG_CREATE2_SCOPE = "iRobot Create2 scope %1 %2";

Blockly.Msg.HEDGEHOG_CREATE_DRIVE_DIRECT = "fahre mit dem Create %1 Sekunden lang mit Geschwindigkeiten %2 & %3";
Blockly.Msg.HEDGEHOG_CREATE_DRIVE_DIRECT_TOOLTIP = "Fährt den Create für eine bestimmte Zeit";

// <GSL customizable: extra-msgs>
Blockly.Msg.HEDGEHOG_WARN = "Dieser Block muss sich innerhalb eines Hedgehog Scope Blocks befinden!";
Blockly.Msg.HEDGEHOG_CREATE_WARN = "Dieser Block muss sich innerhalb eines iRobot Create oder Create2 Scope Blocks befinden!";
Blockly.Msg.HEDGEHOG_CREATE2_SCOPE_TOOLTIP = Blockly.Msg.HEDGEHOG_CREATE_SCOPE_TOOLTIP;

Blockly.Msg.HEDGEHOG_FORWARD = "vorwärts";
Blockly.Msg.HEDGEHOG_BACKWARD = "rückwärts";
Blockly.Msg.HEDGEHOG_RIGHT = "rechts ⟳";
Blockly.Msg.HEDGEHOG_LEFT = "links ⟲";
// </GSL customizable: extra-msgs>
