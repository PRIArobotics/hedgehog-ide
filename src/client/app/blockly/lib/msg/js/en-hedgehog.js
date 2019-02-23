'use strict';

goog.provide('Blockly.Msg.en.hedgehog');

goog.require('Blockly.Msg');

// <default GSL customizable: module-extras />

Blockly.Msg.HEDGEHOG_SCOPE = "Hedgehog scope %1 %2";
Blockly.Msg.HEDGEHOG_SCOPE_TOOLTIP = "All Hedgehog blocks have to be inside of this block";

Blockly.Msg.HEDGEHOG_MOVE = "move motor %1 %2 for %3 seconds";
Blockly.Msg.HEDGEHOG_MOVE_TOOLTIP = "move one motor for a certain duration";

Blockly.Msg.HEDGEHOG_MOVE_UNLIMITED = "move motor %1 %2";
Blockly.Msg.HEDGEHOG_MOVE_UNLIMITED_TOOLTIP = "move motor until stopped explicitly";

Blockly.Msg.HEDGEHOG_MOVE2 = "move motor %1 and %2 with speeds %3 and %4 for %5 seconds";
Blockly.Msg.HEDGEHOG_MOVE2_TOOLTIP = "move two motors for a certain duration";

Blockly.Msg.HEDGEHOG_MOVE2_UNLIMITED = "move motor %1 and %2 with speeds %3 and %4";
Blockly.Msg.HEDGEHOG_MOVE2_UNLIMITED_TOOLTIP = "move two motors until stopped explicitly";

Blockly.Msg.HEDGEHOG_FORWARD = "move motor %1 and %2 %3 for %4 seconds";
Blockly.Msg.HEDGEHOG_FORWARD_TOOLTIP = "move two motors for a certain duration";

Blockly.Msg.HEDGEHOG_TURN = "turn motors %1 and %2 %3 for %4 seconds";
Blockly.Msg.HEDGEHOG_TURN_TOOLTIP = "turn the Hedgehog for a certain duration";

Blockly.Msg.HEDGEHOG_SERVO = "set servo %1 to %2 degrees";
Blockly.Msg.HEDGEHOG_SERVO_TOOLTIP = "move a servo to a specified position";

Blockly.Msg.HEDGEHOG_SERVO_OFF = "turn servo %1 off";
Blockly.Msg.HEDGEHOG_SERVO_OFF_TOOLTIP = "turn a servo off";

Blockly.Msg.HEDGEHOG_PULLUP = "port %1 pullup %2";
Blockly.Msg.HEDGEHOG_PULLUP_TOOLTIP = "set the pullup state for a specified IO port";

Blockly.Msg.HEDGEHOG_READ_ANALOG = "analog port %1";
Blockly.Msg.HEDGEHOG_READ_ANALOG_TOOLTIP = "get the value of an analog port";

Blockly.Msg.HEDGEHOG_READ_DIGITAL = "digital port %1";
Blockly.Msg.HEDGEHOG_READ_DIGITAL_TOOLTIP = "get the value of a digital port";

Blockly.Msg.HEDGEHOG_SLEEP = "sleep for %1 seconds";
Blockly.Msg.HEDGEHOG_SLEEP_TOOLTIP = "pause the program for a certain amount of time";

Blockly.Msg.HEDGEHOG_CREATE_SCOPE = "iRobot Create scope %1 %2";
Blockly.Msg.HEDGEHOG_CREATE_SCOPE_TOOLTIP = "All Create blocks have to be inside of this block";

Blockly.Msg.HEDGEHOG_CREATE2_SCOPE = "iRobot Create2 scope %1 %2";

Blockly.Msg.HEDGEHOG_CREATE_DRIVE_DIRECT = "drive the Create for %1 seconds with velocities %2 & %3";
Blockly.Msg.HEDGEHOG_CREATE_DRIVE_DIRECT_TOOLTIP = "Drives the Create for a certain amount of time";

// <GSL customizable: extra-msgs>
Blockly.Msg.HEDGEHOG_WARN = "This block needs to be inside a Hedgehog Scope block!";
Blockly.Msg.HEDGEHOG_CREATE_WARN = "This block needs to be inside an iRobot Create Scope block!";
Blockly.Msg.HEDGEHOG_CREATE2_SCOPE_TOOLTIP = Blockly.Msg.HEDGEHOG_CREATE_SCOPE_TOOLTIP;

Blockly.Msg.HEDGEHOG_FORWARD = "forward";
Blockly.Msg.HEDGEHOG_BACKWARD = "backward";
Blockly.Msg.HEDGEHOG_RIGHT = "right ⟳";
Blockly.Msg.HEDGEHOG_LEFT = "left ⟲";
// </GSL customizable: extra-msgs>
