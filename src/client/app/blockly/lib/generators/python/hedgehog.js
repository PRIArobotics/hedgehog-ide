'use strict';

goog.provide('Blockly.Python.hedgehog');

goog.require('Blockly.Python');

// set indentaion to 4 spaces
Blockly.Python.INDENT = '    ';

Blockly.Python['hedgehog_scope'] = function(block) {
    var statements = Blockly.Python.statementToCode(block, 'IN');
    Blockly.Python.definitions_['import_hedgehog'] = 'from hedgehog.client import connect';

    var code = 'with connect(emergency=15) as hedgehog:\n' + statements;
    return code;
};

Blockly.Python['hedgehog_turn'] = function(block) {
    var port1 = block.getFieldValue('MOTOR1');
    var port2 = block.getFieldValue('MOTOR2');
    var dir = block.getFieldValue('DIR');
    var time = Blockly.Python.valueToCode(block, 'TIME', Blockly.Python.ORDER_ATOMIC);

    // imports
    Blockly.Python.definitions_['import_sleep'] = 'from time import sleep';
    Blockly.Python.definitions_['import_hedgehog'] = 'from hedgehog.client import connect';

    var code = 'hedgehog.move(' + port1 + ', ' + (dir === 'RIGHT' ? '' : '-') + '1000)\n';
    code += 'hedgehog.move(' + port2 + ', ' + (dir === 'LEFT' ? '' : '-') + '1000)\n';
    code += 'sleep(' + time + ')\n\n';

    return code;
};

Blockly.Python['hedgehog_move'] = function(block) {
    var port = block.getFieldValue('PORT');
    var speed = Blockly.Python.valueToCode(block, 'SPEED', Blockly.Python.ORDER_NONE);
    var time = Blockly.Python.valueToCode(block, 'TIME', Blockly.Python.ORDER_ATOMIC);

    // imports
    Blockly.Python.definitions_['import_sleep'] = 'from time import sleep';
    Blockly.Python.definitions_['import_hedgehog'] = 'from hedgehog.client import connect';

    var code = 'hedgehog.move(' + port + ', ' + speed + ')' + '\nsleep(' + time + ')\n\n';
    return code;
};

Blockly.Python['hedgehog_speed'] = function(block) {
    var speed = block.getFieldValue('SPEED');
    return [speed, Blockly.Python.ORDER_NONE];
};

Blockly.Python['hedgehog_servo'] = function(block) {
    var port = block.getFieldValue('PORT');
    var angle = Blockly.Python.valueToCode(block, 'ANGLE', Blockly.Python.ORDER_NONE);

    // imports
    Blockly.Python.definitions_['import_sleep'] = 'from time import sleep';
    Blockly.Python.definitions_['import_hedgehog'] = 'from hedgehog.client import connect';

    var code = 'hedgehog.set_servo(' + port + ', True, ' + angle + '*22' + ')\n';
    code += 'sleep(0.1)\n\n';
    return code;
};

Blockly.Python['hedgehog_degrees'] = function(block) {
    var angle = block.getFieldValue('ANGLE');

    // imports
    Blockly.Python.definitions_['import_hedgehog'] = 'from hedgehog.client import connect';

    return [angle, Blockly.Python.ORDER_NONE];
};

Blockly.Python['hedgehog_read_analog'] = function(block) {
    var port = block.getFieldValue('PORT');

    var code = 'hedgehog.get_analog(' + port + ')';
    return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Python['hedgehog_read_digital'] = function(block) {
    var port = block.getFieldValue('PORT');

    var code = 'hedgeho.get_digital(' + port + ')';
    return [code, Blockly.Python.ORDER_NONE];
};
