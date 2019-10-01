'use strict';

goog.provide('Blockly.Blocks.hedgehog');

goog.require('Blockly.Blocks');


// <default GSL customizable: module-header>
// Common HSV hue for all blocks in this category.
Blockly.Blocks.hedgehog.HUE = 120;
Blockly.Constants.Loops.HUE = 120;

// Common Help URL for all blocks in this category
Blockly.Blocks.hedgehog.HELPURL = "https://hedgehog.pria.at/";
// </GSL customizable: module-header>

// <default GSL customizable: module-extras />

function requiresScope(kind) {
    let scopeTypes = kind === 'hedgehog'? ['hedgehog_scope'] : ['hedgehog_create_scope', 'hedgehog_create2_scope'];
    scopeTypes.push('procedures_defreturn', 'procedures_defnoreturn');
    let warning = kind === 'hedgehog'? Blockly.Msg.HEDGEHOG_WARN : Blockly.Msg.HEDGEHOG_CREATE_WARN;
    return function onchange(e) {
        if (this.workspace.isDragging()) {
            return;  // Don't change state at the start of a drag.
        }
        let legal = false;
        // Is the block nested in a scope?
        for (let block = this; block = block.getSurroundParent(); block) {
            if (scopeTypes.indexOf(block.type) !== -1) {
                legal = true;
                break;
            }
        }
        if (legal) {
            this.setWarningText(null);
            if (!this.isInFlyout) {
                this.setDisabled(false);
            }
        } else {
            this.setWarningText(warning);
            if (!this.isInFlyout && !this.getInheritedDisabled()) {
                this.setDisabled(true);
            }
        }
    }
}

Blockly.Blocks['hedgehog_scope'] = {
    init: function() {
        this.jsonInit({
            "message0": Blockly.Msg.HEDGEHOG_SCOPE,
            "args0": [
                {
                    "type": "input_dummy"
                },
                {
                    "type": "input_statement",
                    "name": "IN"
                }
            ],
            "previousStatement": null,
            "nextStatement": null,
            "tooltip": Blockly.Msg.HEDGEHOG_SCOPE_TOOLTIP,
            "colour": Blockly.Blocks.hedgehog.HUE,
            "helpUrl": Blockly.Blocks.hedgehog.HELPURL
        });
    },
};

Blockly.Blocks['hedgehog_move'] = {
    init: function() {
        this.jsonInit({
            "message0": Blockly.Msg.HEDGEHOG_MOVE,
            "args0": [
                {
                    "type": "field_number",
                    "name": "PORT",
                    "value": 0,
                    "min": 0,
                    "max": 3,
                    "precision": 1
                },
                {
                    "type": "input_value",
                    "name": "SPEED",
                    "check": "Number"
                },
                {
                    "type": "input_value",
                    "name": "TIME",
                    "check": "Number"
                }
            ],
            "inputsInline": true,
            "previousStatement": null,
            "nextStatement": null,
            "tooltip": Blockly.Msg.HEDGEHOG_MOVE_TOOLTIP,
            "colour": Blockly.Blocks.hedgehog.HUE,
            "helpUrl": Blockly.Blocks.hedgehog.HELPURL
        });
    },
    onchange: requiresScope('hedgehog')
};

Blockly.Blocks['hedgehog_move_unlimited'] = {
    init: function() {
        this.jsonInit({
            "message0": Blockly.Msg.HEDGEHOG_MOVE_UNLIMITED,
            "args0": [
                {
                    "type": "field_number",
                    "name": "PORT",
                    "value": 0,
                    "min": 0,
                    "max": 3,
                    "precision": 1
                },
                {
                    "type": "input_value",
                    "name": "SPEED",
                    "check": "Number"
                }
            ],
            "inputsInline": true,
            "previousStatement": null,
            "nextStatement": null,
            "tooltip": Blockly.Msg.HEDGEHOG_MOVE_UNLIMITED_TOOLTIP,
            "colour": Blockly.Blocks.hedgehog.HUE,
            "helpUrl": Blockly.Blocks.hedgehog.HELPURL
        });
    },
    onchange: requiresScope('hedgehog')
};

Blockly.Blocks['hedgehog_motor_off'] = {
    init: function() {
        this.jsonInit({
            "message0": Blockly.Msg.HEDGEHOG_MOTOR_OFF,
            "args0": [
                {
                    "type": "field_number",
                    "name": "PORT",
                    "value": 0,
                    "min": 0,
                    "max": 3,
                    "precision": 1
                }
            ],
            "inputsInline": true,
            "previousStatement": null,
            "nextStatement": null,
            "tooltip": Blockly.Msg.HEDGEHOG_MOTOR_OFF_TOOLTIP,
            "colour": Blockly.Blocks.hedgehog.HUE,
            "helpUrl": Blockly.Blocks.hedgehog.HELPURL
        });
    },
    onchange: requiresScope('hedgehog')
};

Blockly.Blocks['hedgehog_brake'] = {
    init: function() {
        this.jsonInit({
            "message0": Blockly.Msg.HEDGEHOG_BRAKE,
            "args0": [
                {
                    "type": "field_number",
                    "name": "PORT",
                    "value": 0,
                    "min": 0,
                    "max": 3,
                    "precision": 1
                }
            ],
            "inputsInline": true,
            "previousStatement": null,
            "nextStatement": null,
            "tooltip": Blockly.Msg.HEDGEHOG_BRAKE_TOOLTIP,
            "colour": Blockly.Blocks.hedgehog.HUE,
            "helpUrl": Blockly.Blocks.hedgehog.HELPURL
        });
    },
    onchange: requiresScope('hedgehog')
};

Blockly.Blocks['hedgehog_move2'] = {
    init: function() {
        this.jsonInit({
            "message0": Blockly.Msg.HEDGEHOG_MOVE2,
            "args0": [
                {
                    "type": "field_number",
                    "name": "PORT1",
                    "value": 0,
                    "min": 0,
                    "max": 3,
                    "precision": 1
                },
                {
                    "type": "field_number",
                    "name": "PORT2",
                    "value": 1,
                    "min": 0,
                    "max": 3,
                    "precision": 1
                },
                {
                    "type": "input_value",
                    "name": "SPEED1",
                    "check": "Number"
                },
                {
                    "type": "input_value",
                    "name": "SPEED2",
                    "check": "Number"
                },
                {
                    "type": "input_value",
                    "name": "TIME",
                    "check": "Number"
                }
            ],
            "inputsInline": true,
            "previousStatement": null,
            "nextStatement": null,
            "tooltip": Blockly.Msg.HEDGEHOG_MOVE2_TOOLTIP,
            "colour": Blockly.Blocks.hedgehog.HUE,
            "helpUrl": Blockly.Blocks.hedgehog.HELPURL
        });
    },
    onchange: requiresScope('hedgehog')
};

Blockly.Blocks['hedgehog_move2_unlimited'] = {
    init: function() {
        this.jsonInit({
            "message0": Blockly.Msg.HEDGEHOG_MOVE2_UNLIMITED,
            "args0": [
                {
                    "type": "field_number",
                    "name": "PORT1",
                    "value": 0,
                    "min": 0,
                    "max": 3,
                    "precision": 1
                },
                {
                    "type": "field_number",
                    "name": "PORT2",
                    "value": 1,
                    "min": 0,
                    "max": 3,
                    "precision": 1
                },
                {
                    "type": "input_value",
                    "name": "SPEED1",
                    "check": "Number"
                },
                {
                    "type": "input_value",
                    "name": "SPEED2",
                    "check": "Number"
                }
            ],
            "inputsInline": true,
            "previousStatement": null,
            "nextStatement": null,
            "tooltip": Blockly.Msg.HEDGEHOG_MOVE2_UNLIMITED_TOOLTIP,
            "colour": Blockly.Blocks.hedgehog.HUE,
            "helpUrl": Blockly.Blocks.hedgehog.HELPURL
        });
    },
    onchange: requiresScope('hedgehog')
};

Blockly.Blocks['hedgehog_forward'] = {
    init: function() {
        this.jsonInit({
            "message0": Blockly.Msg.HEDGEHOG_FORWARD,
            "args0": [
                {
                    "type": "field_number",
                    "name": "PORT1",
                    "value": 0,
                    "min": 0,
                    "max": 3,
                    "precision": 1
                },
                {
                    "type": "field_number",
                    "name": "PORT2",
                    "value": 1,
                    "min": 0,
                    "max": 3,
                    "precision": 1
                },
                {
                    "type": "input_value",
                    "name": "SPEED",
                    "check": "Number"
                },
                {
                    "type": "input_value",
                    "name": "TIME",
                    "check": "Number"
                }
            ],
            "inputsInline": true,
            "previousStatement": null,
            "nextStatement": null,
            "tooltip": Blockly.Msg.HEDGEHOG_FORWARD_TOOLTIP,
            "colour": Blockly.Blocks.hedgehog.HUE,
            "helpUrl": Blockly.Blocks.hedgehog.HELPURL
        });
    },
    onchange: requiresScope('hedgehog')
};

Blockly.Blocks['hedgehog_turn'] = {
    init: function() {
        this.jsonInit({
            "message0": Blockly.Msg.HEDGEHOG_TURN,
            "args0": [
                {
                    "type": "field_number",
                    "name": "PORT1",
                    "value": 0,
                    "min": 0,
                    "max": 3,
                    "precision": 1
                },
                {
                    "type": "field_number",
                    "name": "PORT2",
                    "value": 1,
                    "min": 0,
                    "max": 3,
                    "precision": 1
                },
                {
                    "type": "input_value",
                    "name": "DIR",
                    "check": "Number"
                },
                {
                    "type": "input_value",
                    "name": "TIME",
                    "check": "Number"
                }
            ],
            "inputsInline": true,
            "previousStatement": null,
            "nextStatement": null,
            "tooltip": Blockly.Msg.HEDGEHOG_TURN_TOOLTIP,
            "colour": Blockly.Blocks.hedgehog.HUE,
            "helpUrl": Blockly.Blocks.hedgehog.HELPURL
        });
    },
    onchange: requiresScope('hedgehog')
};

Blockly.Blocks['hedgehog_motor_off2'] = {
    init: function() {
        this.jsonInit({
            "message0": Blockly.Msg.HEDGEHOG_MOTOR_OFF2,
            "args0": [
                {
                    "type": "field_number",
                    "name": "PORT1",
                    "value": 0,
                    "min": 0,
                    "max": 3,
                    "precision": 1
                },
                {
                    "type": "field_number",
                    "name": "PORT2",
                    "value": 1,
                    "min": 0,
                    "max": 3,
                    "precision": 1
                }
            ],
            "inputsInline": true,
            "previousStatement": null,
            "nextStatement": null,
            "tooltip": Blockly.Msg.HEDGEHOG_MOTOR_OFF2_TOOLTIP,
            "colour": Blockly.Blocks.hedgehog.HUE,
            "helpUrl": Blockly.Blocks.hedgehog.HELPURL
        });
    },
    onchange: requiresScope('hedgehog')
};

Blockly.Blocks['hedgehog_brake2'] = {
    init: function() {
        this.jsonInit({
            "message0": Blockly.Msg.HEDGEHOG_BRAKE2,
            "args0": [
                {
                    "type": "field_number",
                    "name": "PORT1",
                    "value": 0,
                    "min": 0,
                    "max": 3,
                    "precision": 1
                },
                {
                    "type": "field_number",
                    "name": "PORT2",
                    "value": 1,
                    "min": 0,
                    "max": 3,
                    "precision": 1
                }
            ],
            "inputsInline": true,
            "previousStatement": null,
            "nextStatement": null,
            "tooltip": Blockly.Msg.HEDGEHOG_BRAKE2_TOOLTIP,
            "colour": Blockly.Blocks.hedgehog.HUE,
            "helpUrl": Blockly.Blocks.hedgehog.HELPURL
        });
    },
    onchange: requiresScope('hedgehog')
};

Blockly.Blocks['hedgehog_servo'] = {
    init: function() {
        this.jsonInit({
            "message0": Blockly.Msg.HEDGEHOG_SERVO,
            "args0": [
                {
                    "type": "field_number",
                    "name": "PORT",
                    "value": 0,
                    "min": 0,
                    "max": 5,
                    "precision": 1
                },
                {
                    "type": "input_value",
                    "name": "ANGLE",
                    "check": "Number"
                }
            ],
            "inputsInline": true,
            "previousStatement": null,
            "nextStatement": null,
            "tooltip": Blockly.Msg.HEDGEHOG_SERVO_TOOLTIP,
            "colour": Blockly.Blocks.hedgehog.HUE,
            "helpUrl": Blockly.Blocks.hedgehog.HELPURL
        });
    },
    onchange: requiresScope('hedgehog')
};

Blockly.Blocks['hedgehog_servo_off'] = {
    init: function() {
        this.jsonInit({
            "message0": Blockly.Msg.HEDGEHOG_SERVO_OFF,
            "args0": [
                {
                    "type": "field_number",
                    "name": "PORT",
                    "value": 0,
                    "min": 0,
                    "max": 5,
                    "precision": 1
                }
            ],
            "inputsInline": true,
            "previousStatement": null,
            "nextStatement": null,
            "tooltip": Blockly.Msg.HEDGEHOG_SERVO_OFF_TOOLTIP,
            "colour": Blockly.Blocks.hedgehog.HUE,
            "helpUrl": Blockly.Blocks.hedgehog.HELPURL
        });
    },
    onchange: requiresScope('hedgehog')
};

Blockly.Blocks['hedgehog_speaker'] = {
    init: function() {
        this.jsonInit({
            "message0": Blockly.Msg.HEDGEHOG_SPEAKER,
            "args0": [
                {
                    "type": "input_value",
                    "name": "FREQUENCY",
                    "check": "Number",
                    "value": 440,
                    "min": 50,
                    "max": 15000,
                    "precision": 1
                }
            ],
            "inputsInline": true,
            "previousStatement": null,
            "nextStatement": null,
            "tooltip": Blockly.Msg.HEDGEHOG_SPEAKER_TOOLTIP,
            "colour": Blockly.Blocks.hedgehog.HUE,
            "helpUrl": Blockly.Blocks.hedgehog.HELPURL
        });
    },
    onchange: requiresScope('hedgehog')
};

Blockly.Blocks['hedgehog_speaker_off'] = {
    init: function() {
        this.jsonInit({
            "message0": Blockly.Msg.HEDGEHOG_SPEAKER_OFF,
            "inputsInline": true,
            "previousStatement": null,
            "nextStatement": null,
            "tooltip": Blockly.Msg.HEDGEHOG_SPEAKER_OFF_TOOLTIP,
            "colour": Blockly.Blocks.hedgehog.HUE,
            "helpUrl": Blockly.Blocks.hedgehog.HELPURL
        });
    },
    onchange: requiresScope('hedgehog')
};

Blockly.Blocks['hedgehog_pullup'] = {
    init: function() {
        this.jsonInit({
            "message0": Blockly.Msg.HEDGEHOG_PULLUP,
            "args0": [
                {
                    "type": "field_number",
                    "name": "PORT",
                    "value": 0,
                    "min": 0,
                    "max": 15,
                    "precision": 1
                },
                {
                    "type": "field_checkbox",
                    "name": "STATE",
                    "checked": true
                }
            ],
            "inputsInline": true,
            "previousStatement": null,
            "nextStatement": null,
            "tooltip": Blockly.Msg.HEDGEHOG_PULLUP_TOOLTIP,
            "colour": Blockly.Blocks.hedgehog.HUE,
            "helpUrl": Blockly.Blocks.hedgehog.HELPURL
        });
    },
    onchange: requiresScope('hedgehog')
};

Blockly.Blocks['hedgehog_read_analog'] = {
    init: function() {
        this.jsonInit({
            "message0": Blockly.Msg.HEDGEHOG_READ_ANALOG,
            "args0": [
                {
                    "type": "field_number",
                    "name": "PORT",
                    "value": 0,
                    "min": 0,
                    "max": 15,
                    "precision": 1
                }
            ],
            "output": "Number",
            "tooltip": Blockly.Msg.HEDGEHOG_READ_ANALOG_TOOLTIP,
            "colour": Blockly.Blocks.hedgehog.HUE,
            "helpUrl": Blockly.Blocks.hedgehog.HELPURL
        });
    },
    onchange: requiresScope('hedgehog')
};

Blockly.Blocks['hedgehog_read_digital'] = {
    init: function() {
        this.jsonInit({
            "message0": Blockly.Msg.HEDGEHOG_READ_DIGITAL,
            "args0": [
                {
                    "type": "field_number",
                    "name": "PORT",
                    "value": 0,
                    "min": 0,
                    "max": 15,
                    "precision": 1
                }
            ],
            "output": "Boolean",
            "tooltip": Blockly.Msg.HEDGEHOG_READ_DIGITAL_TOOLTIP,
            "colour": Blockly.Blocks.hedgehog.HUE,
            "helpUrl": Blockly.Blocks.hedgehog.HELPURL
        });
    },
    onchange: requiresScope('hedgehog')
};

Blockly.Blocks['hedgehog_read_imu'] = {
    init: function() {
        this.jsonInit({
            "message0": Blockly.Msg.HEDGEHOG_READ_IMU,
            "args0": [
                {
                    "type": "field_dropdown",
                    "name": "TYPE",
                    "options": [
                        [
                            Blockly.Msg.HEDGEHOG_READ_IMU_POSE,
                            "POSE"
                        ],
                        [
                            Blockly.Msg.HEDGEHOG_READ_IMU_ACCELERATION,
                            "ACCELERATION"
                        ],
                        [
                            Blockly.Msg.HEDGEHOG_READ_IMU_RATE,
                            "RATE"
                        ]
                    ]
                },
                {
                    "type": "field_dropdown",
                    "name": "AXIS",
                    "options": [
                        [
                            "x",
                            "X"
                        ],
                        [
                            "y",
                            "Y"
                        ],
                        [
                            "z",
                            "Z"
                        ],
                        [
                            "x, y, z",
                            "XYZ"
                        ]
                    ]
                }
            ],
            "output": "Number",
            "tooltip": Blockly.Msg.HEDGEHOG_READ_IMU_TOOLTIP,
            "colour": Blockly.Blocks.hedgehog.HUE,
            "helpUrl": Blockly.Blocks.hedgehog.HELPURL
        });
    },
    onchange: requiresScope('hedgehog')
};

Blockly.Blocks['hedgehog_sleep'] = {
    init: function() {
        this.jsonInit({
            "message0": Blockly.Msg.HEDGEHOG_SLEEP,
            "args0": [
                {
                    "type": "input_value",
                    "name": "TIME",
                    "check": "Number"
                }
            ],
            "inputsInline": true,
            "previousStatement": null,
            "nextStatement": null,
            "tooltip": Blockly.Msg.HEDGEHOG_SLEEP_TOOLTIP,
            "colour": Blockly.Blocks.hedgehog.HUE,
            "helpUrl": Blockly.Blocks.hedgehog.HELPURL
        });
    },
    onchange: requiresScope('hedgehog')
};

Blockly.Blocks['hedgehog_create_scope'] = {
    init: function() {
        this.jsonInit({
            "message0": Blockly.Msg.HEDGEHOG_CREATE_SCOPE,
            "args0": [
                {
                    "type": "input_dummy"
                },
                {
                    "type": "input_statement",
                    "name": "IN"
                }
            ],
            "previousStatement": null,
            "nextStatement": null,
            "tooltip": Blockly.Msg.HEDGEHOG_CREATE_SCOPE_TOOLTIP,
            "colour": Blockly.Blocks.hedgehog.HUE,
            "helpUrl": Blockly.Blocks.hedgehog.HELPURL
        });
    },
};

Blockly.Blocks['hedgehog_create2_scope'] = {
    init: function() {
        this.jsonInit({
            "message0": Blockly.Msg.HEDGEHOG_CREATE2_SCOPE,
            "args0": [
                {
                    "type": "input_dummy"
                },
                {
                    "type": "input_statement",
                    "name": "IN"
                }
            ],
            "previousStatement": null,
            "nextStatement": null,
            "tooltip": Blockly.Msg.HEDGEHOG_CREATE2_SCOPE_TOOLTIP,
            "colour": Blockly.Blocks.hedgehog.HUE,
            "helpUrl": Blockly.Blocks.hedgehog.HELPURL
        });
    },
};

Blockly.Blocks['hedgehog_create_drive_direct'] = {
    init: function() {
        this.jsonInit({
            "message0": Blockly.Msg.HEDGEHOG_CREATE_DRIVE_DIRECT,
            "args0": [
                {
                    "type": "input_value",
                    "name": "TIME",
                    "check": "Number"
                },
                {
                    "type": "input_value",
                    "name": "LSPEED",
                    "check": "Number"
                },
                {
                    "type": "input_value",
                    "name": "RSPEED",
                    "check": "Number"
                }
            ],
            "inputsInline": true,
            "previousStatement": null,
            "nextStatement": null,
            "tooltip": Blockly.Msg.HEDGEHOG_CREATE_DRIVE_DIRECT_TOOLTIP,
            "colour": Blockly.Blocks.hedgehog.HUE,
            "helpUrl": Blockly.Blocks.hedgehog.HELPURL
        });
    },
    onchange: requiresScope('create')
};

Blockly.Blocks['hedgehog_lego_motor_config'] = {
    init: function() {
        this.jsonInit({
            "message0": Blockly.Msg.HEDGEHOG_LEGO_MOTOR_CONFIG,
            "args0": [
                {
                    "type": "field_number",
                    "name": "PORT",
                    "value": 0,
                    "min": 0,
                    "max": 3,
                    "precision": 1
                }
            ],
            "inputsInline": true,
            "previousStatement": null,
            "nextStatement": null,
            "tooltip": Blockly.Msg.HEDGEHOG_LEGO_MOTOR_CONFIG_TOOLTIP,
            "colour": Blockly.Blocks.hedgehog.HUE,
            "helpUrl": Blockly.Blocks.hedgehog.HELPURL
        });
    },
    onchange: requiresScope('hedgehog')
};

Blockly.Blocks['hedgehog_lego_sensor_config'] = {
    init: function() {
        this.jsonInit({
            "message0": Blockly.Msg.HEDGEHOG_LEGO_SENSOR_CONFIG,
            "args0": [
                {
                    "type": "field_number",
                    "name": "PORT",
                    "value": 8,
                    "min": 8,
                    "max": 11,
                    "precision": 1
                }
            ],
            "inputsInline": true,
            "previousStatement": null,
            "nextStatement": null,
            "tooltip": Blockly.Msg.HEDGEHOG_LEGO_SENSOR_CONFIG_TOOLTIP,
            "colour": Blockly.Blocks.hedgehog.HUE,
            "helpUrl": Blockly.Blocks.hedgehog.HELPURL
        });
    },
    onchange: requiresScope('hedgehog')
};

Blockly.Blocks['hedgehog_lego_move'] = {
    init: function() {
        this.jsonInit({
            "message0": Blockly.Msg.HEDGEHOG_LEGO_MOVE,
            "args0": [
                {
                    "type": "field_number",
                    "name": "PORT",
                    "value": 0,
                    "min": 0,
                    "max": 3,
                    "precision": 1
                },
                {
                    "type": "input_value",
                    "name": "SPEED",
                    "check": "Number"
                },
                {
                    "type": "input_value",
                    "name": "TIME",
                    "check": "Number"
                }
            ],
            "inputsInline": true,
            "previousStatement": null,
            "nextStatement": null,
            "tooltip": Blockly.Msg.HEDGEHOG_LEGO_MOVE_TOOLTIP,
            "colour": Blockly.Blocks.hedgehog.HUE,
            "helpUrl": Blockly.Blocks.hedgehog.HELPURL
        });
    },
    onchange: requiresScope('hedgehog')
};

Blockly.Blocks['hedgehog_lego_move_unlimited'] = {
    init: function() {
        this.jsonInit({
            "message0": Blockly.Msg.HEDGEHOG_LEGO_MOVE_UNLIMITED,
            "args0": [
                {
                    "type": "field_number",
                    "name": "PORT",
                    "value": 0,
                    "min": 0,
                    "max": 3,
                    "precision": 1
                },
                {
                    "type": "input_value",
                    "name": "SPEED",
                    "check": "Number"
                }
            ],
            "inputsInline": true,
            "previousStatement": null,
            "nextStatement": null,
            "tooltip": Blockly.Msg.HEDGEHOG_LEGO_MOVE_UNLIMITED_TOOLTIP,
            "colour": Blockly.Blocks.hedgehog.HUE,
            "helpUrl": Blockly.Blocks.hedgehog.HELPURL
        });
    },
    onchange: requiresScope('hedgehog')
};

Blockly.Blocks['hedgehog_lego_move2'] = {
    init: function() {
        this.jsonInit({
            "message0": Blockly.Msg.HEDGEHOG_LEGO_MOVE2,
            "args0": [
                {
                    "type": "field_number",
                    "name": "PORT1",
                    "value": 0,
                    "min": 0,
                    "max": 3,
                    "precision": 1
                },
                {
                    "type": "field_number",
                    "name": "PORT2",
                    "value": 1,
                    "min": 0,
                    "max": 3,
                    "precision": 1
                },
                {
                    "type": "input_value",
                    "name": "SPEED1",
                    "check": "Number"
                },
                {
                    "type": "input_value",
                    "name": "SPEED2",
                    "check": "Number"
                },
                {
                    "type": "input_value",
                    "name": "TIME",
                    "check": "Number"
                }
            ],
            "inputsInline": true,
            "previousStatement": null,
            "nextStatement": null,
            "tooltip": Blockly.Msg.HEDGEHOG_LEGO_MOVE2_TOOLTIP,
            "colour": Blockly.Blocks.hedgehog.HUE,
            "helpUrl": Blockly.Blocks.hedgehog.HELPURL
        });
    },
    onchange: requiresScope('hedgehog')
};

Blockly.Blocks['hedgehog_lego_move2_unlimited'] = {
    init: function() {
        this.jsonInit({
            "message0": Blockly.Msg.HEDGEHOG_LEGO_MOVE2_UNLIMITED,
            "args0": [
                {
                    "type": "field_number",
                    "name": "PORT1",
                    "value": 0,
                    "min": 0,
                    "max": 3,
                    "precision": 1
                },
                {
                    "type": "field_number",
                    "name": "PORT2",
                    "value": 1,
                    "min": 0,
                    "max": 3,
                    "precision": 1
                },
                {
                    "type": "input_value",
                    "name": "SPEED1",
                    "check": "Number"
                },
                {
                    "type": "input_value",
                    "name": "SPEED2",
                    "check": "Number"
                }
            ],
            "inputsInline": true,
            "previousStatement": null,
            "nextStatement": null,
            "tooltip": Blockly.Msg.HEDGEHOG_LEGO_MOVE2_UNLIMITED_TOOLTIP,
            "colour": Blockly.Blocks.hedgehog.HUE,
            "helpUrl": Blockly.Blocks.hedgehog.HELPURL
        });
    },
    onchange: requiresScope('hedgehog')
};

Blockly.Blocks['hedgehog_lego_forward'] = {
    init: function() {
        this.jsonInit({
            "message0": Blockly.Msg.HEDGEHOG_LEGO_FORWARD,
            "args0": [
                {
                    "type": "field_number",
                    "name": "PORT1",
                    "value": 0,
                    "min": 0,
                    "max": 3,
                    "precision": 1
                },
                {
                    "type": "field_number",
                    "name": "PORT2",
                    "value": 1,
                    "min": 0,
                    "max": 3,
                    "precision": 1
                },
                {
                    "type": "input_value",
                    "name": "SPEED",
                    "check": "Number"
                },
                {
                    "type": "input_value",
                    "name": "TIME",
                    "check": "Number"
                }
            ],
            "inputsInline": true,
            "previousStatement": null,
            "nextStatement": null,
            "tooltip": Blockly.Msg.HEDGEHOG_LEGO_FORWARD_TOOLTIP,
            "colour": Blockly.Blocks.hedgehog.HUE,
            "helpUrl": Blockly.Blocks.hedgehog.HELPURL
        });
    },
    onchange: requiresScope('hedgehog')
};

Blockly.Blocks['hedgehog_lego_turn'] = {
    init: function() {
        this.jsonInit({
            "message0": Blockly.Msg.HEDGEHOG_LEGO_TURN,
            "args0": [
                {
                    "type": "field_number",
                    "name": "PORT1",
                    "value": 0,
                    "min": 0,
                    "max": 3,
                    "precision": 1
                },
                {
                    "type": "field_number",
                    "name": "PORT2",
                    "value": 1,
                    "min": 0,
                    "max": 3,
                    "precision": 1
                },
                {
                    "type": "input_value",
                    "name": "DIR",
                    "check": "Number"
                },
                {
                    "type": "input_value",
                    "name": "TIME",
                    "check": "Number"
                }
            ],
            "inputsInline": true,
            "previousStatement": null,
            "nextStatement": null,
            "tooltip": Blockly.Msg.HEDGEHOG_LEGO_TURN_TOOLTIP,
            "colour": Blockly.Blocks.hedgehog.HUE,
            "helpUrl": Blockly.Blocks.hedgehog.HELPURL
        });
    },
    onchange: requiresScope('hedgehog')
};

// <GSL customizable: extra-blocks>

// Default parameter blocks
Blockly.Blocks['hedgehog_dir'] = {
    init: function() {
        this.setColour(Blockly.Blocks.hedgehog.HUE);
        this.setHelpUrl(Blockly.Blocks.hedgehog.HELPURL);

        this.appendDummyInput()
            .appendField(new Blockly.FieldDropdown([[Blockly.Msg.HEDGEHOG_RIGHT, "1000"], [Blockly.Msg.HEDGEHOG_LEFT, "-1000"]]), "DIR");
        this.setOutput(true, "Number");
        this.setTooltip('');
    }
};

Blockly.Blocks['hedgehog_speed'] = {
    init: function() {
        this.setColour(Blockly.Blocks.hedgehog.HUE);
        this.setHelpUrl(Blockly.Blocks.hedgehog.HELPURL);

        this.appendDummyInput()
            .appendField(new Blockly.FieldDropdown([[Blockly.Msg.HEDGEHOG_FORWARD, "1000"], [Blockly.Msg.HEDGEHOG_BACKWARD, "-1000"]]), "SPEED");
        this.setOutput(true, "Number");
        this.setTooltip('');
    }
};

Blockly.Blocks['hedgehog_degrees'] = {
    init: function() {
        this.setColour(Blockly.Blocks.hedgehog.HUE);
        this.setHelpUrl(Blockly.Blocks.hedgehog.HELPURL);

        Blockly.FieldAngle.ROUND = 5;
        Blockly.FieldAngle.CLOCKWISE = true;
        Blockly.FieldAngle.OFFSET = 90;
        Blockly.FieldAngle.WRAP = 270;
        let field_angle = new Blockly.FieldAngle(45, (value) => {
            let angle = Number(value);
            if(angle < 0) {
                return "0";
            } else if(angle > 180) {
                return "180";
            } else {
                return value;
            }
        });
        this.appendDummyInput().appendField(field_angle, "ANGLE");
        this.setOutput(true, "Number");
        this.setTooltip('');
    }
};
// </GSL customizable: extra-blocks>
