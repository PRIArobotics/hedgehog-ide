'use strict';

goog.provide('Blockly.Blocks.hedgehog');

goog.require('Blockly.Blocks');


// Common HSV hue for all blocks in this category.
Blockly.Blocks.hedgehog.HUE = 120;
Blockly.Constants.Loops.HUE = 120;

// Common Help URL for all blocks in this category
Blockly.Blocks.hedgehog.HELPURL = "http://hedgehog.pria.at/";

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
    }
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
    onchange: function(e) {
        if (this.workspace.isDragging()) {
            return;  // Don't change state at the start of a drag.
        }
        var legal = false;
        // Is the block nested in a loop?
        var block = this;
        do {
            if (block.type == 'hedgehog_scope') {
                legal = true;
                break;
            }
            block = block.getSurroundParent();
        } while (block);
        if (legal) {
            this.setWarningText(null);
            if (!this.isInFlyout) {
                this.setDisabled(false);
            }
        } else {
            this.setWarningText(Blockly.Msg.HEDGEHOG_WARN);
            if (!this.isInFlyout && !this.getInheritedDisabled()) {
                this.setDisabled(true);
            }
        }
    }
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
            "tooltip": Blockly.Msg.HEDGEHOG_MOVE2_TOOLTIP,
            "colour": Blockly.Blocks.hedgehog.HUE,
            "helpUrl": Blockly.Blocks.hedgehog.HELPURL
        });
    },
    onchange: Blockly.Blocks['hedgehog_move'].onchange
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
                },
            ],
            "inputsInline": true,
            "previousStatement": null,
            "nextStatement": null,
            "tooltip": Blockly.Msg.HEDGEHOG_MOVE_UNLIMITED_TOOLTIP,
            "colour": Blockly.Blocks.hedgehog.HUE,
            "helpUrl": Blockly.Blocks.hedgehog.HELPURL
        });
    },
    onchange: Blockly.Blocks['hedgehog_move'].onchange
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
                    "max": 7,
                    "precision": 1
                },
                {
                    "type": "field_checkbox",
                    "name": "STATE",
                    "checked": true
                },
            ],
            "inputsInline": true,
            "previousStatement": null,
            "nextStatement": null,
            "tooltip": Blockly.Msg.HEDGEHOG_PULLUP_TOOLTIP,
            "colour": Blockly.Blocks.hedgehog.HUE,
            "helpUrl": Blockly.Blocks.hedgehog.HELPURL
        });
    },
    onchange: Blockly.Blocks['hedgehog_move'].onchange
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
    onchange: Blockly.Blocks['hedgehog_move'].onchange
};

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
                    "max": 7,
                    "precision": 1
                }
            ],
            "output": "Number",
            "tooltip": Blockly.Msg.HEDGEHOG_READ_ANALOG_TOOLTIP,
            "colour": Blockly.Blocks.hedgehog.HUE,
            "helpUrl": Blockly.Blocks.hedgehog.HELPURL
        });
    },
    onchange: Blockly.Blocks['hedgehog_move'].onchange
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
                    "max": 3,
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
    onchange: Blockly.Blocks['hedgehog_move'].onchange
};

Blockly.Blocks['hedgehog_degrees'] = {
    init: function() {
        this.setColour(Blockly.Blocks.hedgehog.HUE);
        this.setHelpUrl(Blockly.Blocks.hedgehog.HELPURL);

        Blockly.FieldAngle.ROUND = 5;
        Blockly.FieldAngle.CLOCKWISE = true;
        Blockly.FieldAngle.OFFSET = 90;
        this.appendDummyInput()
            .appendField(new Blockly.FieldAngle(45), "ANGLE");
        this.setOutput(true, "Number");
        this.setTooltip('');
    }
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
    }
};

Blockly.Blocks['hedgehog_read_digital'] = {
    init: function() {
        this.jsonInit({
            "message0": Blockly.Msg.HEDGEHOG_READ_DIGITAL,
            "args0": [
                {
                    "type": "field_number",
                    "name": "PORT",
                    "value": 8,
                    "min": 8,
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
    onchange: Blockly.Blocks['hedgehog_move'].onchange
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
    }
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
            "tooltip": Blockly.Msg.HEDGEHOG_CREATE_SCOPE_TOOLTIP,
            "colour": Blockly.Blocks.hedgehog.HUE,
            "helpUrl": Blockly.Blocks.hedgehog.HELPURL
        });
    }
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
            "tooltip": Blockly.Msg.HEDGEHOG_MOVE_TOOLTIP,
            "colour": Blockly.Blocks.hedgehog.HUE,
            "helpUrl": Blockly.Blocks.hedgehog.HELPURL
        });
    },
    onchange: function(e) {
        if (this.workspace.isDragging()) {
            return;  // Don't change state at the start of a drag.
        }
        var legal = false;
        // Is the block nested in a loop?
        var block = this;
        do {
            if (block.type === 'hedgehog_create_scope' || block.type === 'hedgehog_create2_scope') {
                legal = true;
                break;
            }
            block = block.getSurroundParent();
        } while (block);
        if (legal) {
            this.setWarningText(null);
            if (!this.isInFlyout) {
                this.setDisabled(false);
            }
        } else {
            this.setWarningText(Blockly.Msg.HEDGEHOG_CREATE_WARN);
            if (!this.isInFlyout && !this.getInheritedDisabled()) {
                this.setDisabled(true);
            }
        }
    }
};
