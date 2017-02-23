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
            .appendField("hedgehog scope");
        this.appendStatementInput("IN")
            .setCheck(null);
        this.setTooltip('');
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
        this.setTooltip('');
    }
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
            .appendField(new Blockly.FieldDropdown([["right", "RIGHT"], ["left", "LEFT"]]), "DIR")
            .appendField("for");
        this.appendValueInput("NUM")
            .setCheck("Number")
            .setAlign(Blockly.ALIGN_CENTRE);
        this.appendDummyInput()
            .appendField(new Blockly.FieldDropdown([["rounds", "RND"], ["seconds", "SEC"]]), "UNIT");
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setTooltip('');
    }
};

Blockly.Blocks['hedgehog_speed'] = {
    init: function() {
        this.setColour(Blockly.Blocks.hedgehog.HUE);
        this.setHelpUrl(Blockly.Blocks.hedgehog.HELPURL);

        this.appendDummyInput()
            .appendField(new Blockly.FieldDropdown([["forward", "100"], ["backward", "-100"]]), "SPEED");
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
            .appendField(new Blockly.FieldNumber(8, 8, 15, 1), "PORT");
        this.setOutput(true, "Number");
        this.setTooltip('');
    }
};

Blockly.Blocks['hedgehog_read_digital'] = {
    init: function() {
        this.setColour(Blockly.Blocks.hedgehog.HUE);
        this.setHelpUrl(Blockly.Blocks.hedgehog.HELPURL);

        this.appendDummyInput()
            .appendField("read digital pin")
            .appendField(new Blockly.FieldNumber(0, 0, 7, 1), "PORT");
        this.setOutput(true, "Boolean");
        this.setTooltip('');
    }
};
