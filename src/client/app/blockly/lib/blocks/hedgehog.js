'use strict';

goog.provide('Blockly.Blocks.hedgehog');

goog.require('Blockly.Blocks');


/**
 * Common HSV hue for all blocks in this category.
 */
Blockly.Blocks.hedgehog.HUE = 120;
Blockly.Blocks.loops.HUE = 60;

// Common Help URL for all blocks in this category
Blockly.Blocks.hedgehog.HELPURL = "http://hedgehog.pria.at/";

Blockly.Blocks['hedgehog_scope'] = {
    init: function() {
        this.setColour(Blockly.Blocks.hedgehog.HUE);
        this.setHelpUrl(Blockly.Blocks.hedgehog.HELPURL);

        this.appendDummyInput()
            .appendField("Hedgehog scope");
        this.appendStatementInput("IN")
            .setCheck(null);
        this.setTooltip('All Hedgehog blocks have to be inside of this block');
    }
};

Blockly.Blocks['hedgehog_move'] = {
    init: function() {
        this.setColour(Blockly.Blocks.hedgehog.HUE);
        this.setHelpUrl(Blockly.Blocks.hedgehog.HELPURL);

        this.appendDummyInput()
            .appendField("move motor")
            .appendField(new Blockly.FieldNumber(0, 0, 3, 1), "PORT");
        this.appendValueInput("SPEED")
            .setCheck("Number");
        this.appendValueInput("TIME")
            .setCheck("Number")
            .appendField("for");
        this.appendDummyInput()
            .appendField("seconds");
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setTooltip('move one motor for a certain duration');
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
            this.setWarningText("This block needs to be inside a Hedgehog Scope block!");
            if (!this.isInFlyout && !this.getInheritedDisabled()) {
                this.setDisabled(true);
            }
        }
    }
};

Blockly.Blocks['hedgehog_move2'] = {
    init: function() {
        this.setColour(Blockly.Blocks.hedgehog.HUE);
        this.setHelpUrl(Blockly.Blocks.hedgehog.HELPURL);

        this.appendDummyInput()
            .appendField("move motor")
            .appendField(new Blockly.FieldNumber(0, 0, 3, 1), "MOTOR1")
            .appendField("and")
            .appendField(new Blockly.FieldNumber(1, 0, 3, 1), "MOTOR2");
        this.appendValueInput("SPEED")
            .setCheck("Number");
        this.appendValueInput("TIME")
            .setCheck("Number")
            .appendField("for");
        this.appendDummyInput()
            .appendField("seconds");
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setTooltip('move two motors for a certain duration');
    },
    onchange: Blockly.Blocks['hedgehog_move'].onchange
};

Blockly.Blocks['hedgehog_turn'] = {
    init: function() {
        this.setColour(Blockly.Blocks.hedgehog.HUE);
        this.setHelpUrl(Blockly.Blocks.hedgehog.HELPURL);

        this.appendDummyInput()
            .appendField("turn motors")
            .appendField(new Blockly.FieldNumber(0, 0, 3, 1), "MOTOR1")
            .appendField("and")
            .appendField(new Blockly.FieldNumber(1, 0, 3, 1), "MOTOR2")
        this.appendValueInput("DIR")
            .setCheck("Number");
        this.appendValueInput("TIME")
            .appendField("for")
            .setCheck("Number")
            .setAlign(Blockly.ALIGN_CENTRE);
        this.appendDummyInput()
            .appendField("seconds");
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setTooltip('turn the Hedgog for a certain duration');
    },
    onchange: Blockly.Blocks['hedgehog_move'].onchange
};

Blockly.Blocks['hedgehog_dir'] = {
    init: function() {
        this.setColour(Blockly.Blocks.hedgehog.HUE);
        this.setHelpUrl(Blockly.Blocks.hedgehog.HELPURL);

        this.appendDummyInput()
            .appendField(new Blockly.FieldDropdown([["right ⟳", "1000"], ["left ⟲", "-1000"]]), "DIR");
        this.setOutput(true, "Number");
        this.setTooltip('');
    }
};

Blockly.Blocks['hedgehog_speed'] = {
    init: function() {
        this.setColour(Blockly.Blocks.hedgehog.HUE);
        this.setHelpUrl(Blockly.Blocks.hedgehog.HELPURL);

        this.appendDummyInput()
            .appendField(new Blockly.FieldDropdown([["forward", "1000"], ["backward", "-1000"]]), "SPEED");
        this.setOutput(true, "Number");
        this.setTooltip('');
    }
};

Blockly.Blocks['hedgehog_read_analog'] = {
    init: function() {
        this.setColour(Blockly.Blocks.hedgehog.HUE);
        this.setHelpUrl(Blockly.Blocks.hedgehog.HELPURL);

        this.appendDummyInput()
            .appendField("read analog pin")
            .appendField(new Blockly.FieldNumber(0, 0, 7, 1), "PORT");
        this.setOutput(true, "Number");
        this.setTooltip('get the value of an analog pin');
    },
    onchange: Blockly.Blocks['hedgehog_move'].onchange
};

Blockly.Blocks['hedgehog_servo'] = {
    init: function() {
        this.setColour(Blockly.Blocks.hedgehog.HUE);
        this.setHelpUrl(Blockly.Blocks.hedgehog.HELPURL);

        this.appendDummyInput()
            .appendField("set servo")
            .appendField(new Blockly.FieldNumber(0, 0, 3, 1), "PORT")
            .appendField("to");
        this.appendValueInput("ANGLE")
            .setCheck("Number");
        this.appendDummyInput()
            .appendField("degrees");
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setTooltip('move a servo to a specified position');
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
        this.setColour(Blockly.Blocks.hedgehog.HUE);
        this.setHelpUrl(Blockly.Blocks.hedgehog.HELPURL);

        this.appendDummyInput()
            .appendField("sleep for")
        this.appendValueInput("TIME")
            .setCheck("Number");
        this.appendDummyInput()
            .appendField("seconds");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setTooltip('');
    }
};

Blockly.Blocks['hedgehog_read_digital'] = {
    init: function() {
        this.setColour(Blockly.Blocks.hedgehog.HUE);
        this.setHelpUrl(Blockly.Blocks.hedgehog.HELPURL);

        this.appendDummyInput()
            .appendField("read digital pin")
            .appendField(new Blockly.FieldNumber(8, 8, 15, 1), "PORT");
        this.setOutput(true, "Boolean");
        this.setTooltip('get the value of an analog pin');
    },
    onchange: Blockly.Blocks['hedgehog_move'].onchange
};
