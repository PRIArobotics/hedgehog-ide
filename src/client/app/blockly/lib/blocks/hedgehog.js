
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


Blockly.Blocks['hedgehog_move'] = {
    init: function() {
        this.setColour(Blockly.Blocks.hedgehog.HUE);
        this.setHelpUrl(Blockly.Blocks.hedgehog.HELPURL);
        this.appendDummyInput()
            .appendField("move motor")
            .appendField(new Blockly.FieldNumber(0, 0, 3, 1), "port")
            .appendField(new Blockly.FieldDropdown([["forward", "fw"], ["backward", "bw"]]), "dir");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setTooltip('');
    }
};

Blockly.Blocks['hedgehog_read_analog'] = {
    init: function() {
        this.setColour(Blockly.Blocks.hedgehog.HUE);
        this.setHelpUrl(Blockly.Blocks.hedgehog.HELPURL);
        this.appendDummyInput()
            .appendField("read analog pin")
            .appendField(new Blockly.FieldNumber(8, 8, 15, 1), "port");
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
            .appendField(new Blockly.FieldNumber(0, 0, 7, 1), "port");
        this.setOutput(true, "Boolean");
        this.setTooltip('');
    }
};
