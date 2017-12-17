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
    var port1 = block.getFieldValue('PORT1');
    var port2 = block.getFieldValue('PORT2');
    var dir = parseInt(Blockly.Python.valueToCode(block, 'DIR', Blockly.Python.ORDER_NONE));
    var time = Blockly.Python.valueToCode(block, 'TIME', Blockly.Python.ORDER_ATOMIC);

    // imports
    Blockly.Python.definitions_['import_sleep'] = 'from time import sleep';
    Blockly.Python.definitions_['import_hedgehog'] = 'from hedgehog.client import connect';

    var code = 'hedgehog.move(' + port1 + ', ' + dir + ')\n';
    code += 'hedgehog.move(' + port2 + ', ' + (-1 * dir) + ')\n';
    code += 'sleep(' + time + ')\n';
    code += 'hedgehog.move(' + port1 + ', 0)\n';
    code += 'hedgehog.move(' + port2 + ', 0)\n\n';

    return code;
};

Blockly.Python['hedgehog_move2'] = function(block) {
    var port1 = block.getFieldValue('PORT1');
    var port2 = block.getFieldValue('PORT2');
    var speed = Blockly.Python.valueToCode(block, 'SPEED', Blockly.Python.ORDER_NONE);
    var time = Blockly.Python.valueToCode(block, 'TIME', Blockly.Python.ORDER_ATOMIC);

    // imports
    Blockly.Python.definitions_['import_sleep'] = 'from time import sleep';
    Blockly.Python.definitions_['import_hedgehog'] = 'from hedgehog.client import connect';

    var code = 'hedgehog.move(' + port1 + ', ' + speed + ')\n';
    code += 'hedgehog.move(' + port2 + ', ' + speed + ')\n';
    code += 'sleep(' + time + ')\n';
    code += 'hedgehog.move(' + port1 + ', 0)\n';
    code += 'hedgehog.move(' + port2 + ', 0)\n\n';
    return code;
};

Blockly.Python['hedgehog_move'] = function(block) {
    var port = block.getFieldValue('PORT');
    var speed = Blockly.Python.valueToCode(block, 'SPEED', Blockly.Python.ORDER_NONE);
    var time = Blockly.Python.valueToCode(block, 'TIME', Blockly.Python.ORDER_ATOMIC);

    // imports
    Blockly.Python.definitions_['import_sleep'] = 'from time import sleep';
    Blockly.Python.definitions_['import_hedgehog'] = 'from hedgehog.client import connect';

    var code = 'hedgehog.move(' + port + ', ' + speed + ')\n';
    code += 'sleep(' + time + ')\n';
    code += 'hedgehog.move(' + port + ', 0)\n\n';
    return code;
};

Blockly.Python['hedgehog_move_unlimited'] = function(block) {
    var port = block.getFieldValue('PORT');
    var speed = Blockly.Python.valueToCode(block, 'SPEED', Blockly.Python.ORDER_NONE);

    // imports
    Blockly.Python.definitions_['import_hedgehog'] = 'from hedgehog.client import connect';

    var code = 'hedgehog.move(' + port + ', ' + speed + ')\n\n';
    return code;
};

Blockly.Python['hedgehog_pullup'] = function(block) {
    var port = block.getFieldValue('PORT');
    var pullup = block.getFieldValue('STATE') == 'TRUE';

    // imports
    Blockly.Python.definitions_['import_hedgehog'] = 'from hedgehog.client import connect';

    var code = 'hedgehog.set_input_state(' + port + ', ' + (pullup ? 'True' : 'False') + ')\n\n';
    return code;
};

Blockly.Python['hedgehog_speed'] = function(block) {
    var speed = block.getFieldValue('SPEED');
    return [speed, Blockly.Python.ORDER_NONE];
};

Blockly.Python['hedgehog_dir'] = function(block) {
    var speed = block.getFieldValue('DIR');
    return [speed, Blockly.Python.ORDER_NONE];
};

Blockly.Python['hedgehog_servo'] = function(block) {
    var port = block.getFieldValue('PORT');
    var angle = Blockly.Python.valueToCode(block, 'ANGLE', Blockly.Python.ORDER_NONE);

    // imports
    Blockly.Python.definitions_['import_sleep'] = 'from time import sleep';
    Blockly.Python.definitions_['import_hedgehog'] = 'from hedgehog.client import connect';

    var code = 'hedgehog.set_servo(' + port + ', True, ' + Math.floor(parseInt(angle) * 2000 / 180) + ')\n';
    code += 'sleep(0.1)\n\n';
    return code;
};

Blockly.Python['hedgehog_degrees'] = function(block) {
    var angle = block.getFieldValue('ANGLE');

    // imports
    Blockly.Python.definitions_['import_hedgehog'] = 'from hedgehog.client import connect';

    if(parseInt(angle) > 180) {
        return ["180", Blockly.Python.ORDER_NONE];
    }

    return [angle, Blockly.Python.ORDER_NONE];
};

Blockly.Python['hedgehog_read_analog'] = function(block) {
    var port = block.getFieldValue('PORT');

    var code = 'hedgehog.get_analog(' + port + ')';
    return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Python['hedgehog_read_digital'] = function(block) {
    var port = block.getFieldValue('PORT');

    var code = 'hedgehog.get_digital(' + port + ')';
    return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Python['hedgehog_sleep'] = function(block) {
    var time = Blockly.Python.valueToCode(block, 'TIME', Blockly.Python.ORDER_ATOMIC);

    // imports
    Blockly.Python.definitions_['import_sleep'] = 'from time import sleep';

    var code = 'sleep(' + time + ')\n\n';
    return code;
};

Blockly.Python['hedgehog_create_scope'] = function(block) {
    var statements = Blockly.Python.statementToCode(block, 'IN');
    Blockly.Python.definitions_['import_create'] = 'from hedgehog.client import connect_create';

    var code = 'with connect_create() as create:\n';
    code += Blockly.Python.INDENT + 'create.safe()\n\n';
    code += statements;
    return code;
};

Blockly.Python['hedgehog_create2_scope'] = function(block) {
    var statements = Blockly.Python.statementToCode(block, 'IN');
    Blockly.Python.definitions_['import_create2'] = 'from hedgehog.client import connect_create2';

    var code = 'with connect_create2() as create:\n';
    code += Blockly.Python.INDENT + 'create.safe()\n\n';
    code += statements;
    return code;
};

Blockly.Python['hedgehog_create_drive_direct'] = function(block) {
    var time = Blockly.Python.valueToCode(block, 'TIME', Blockly.Python.ORDER_ATOMIC);
    var lspeed = Blockly.Python.valueToCode(block, 'LSPEED', Blockly.Python.ORDER_NONE);
    var rspeed = Blockly.Python.valueToCode(block, 'RSPEED', Blockly.Python.ORDER_NONE);

    // imports
    Blockly.Python.definitions_['import_sleep'] = 'from time import sleep';
    Blockly.Python.definitions_['import_create'] = 'from hedgehog.client import connect_create';

    var code = 'create.drive_direct(' + lspeed + ', ' + rspeed + ')\n';
    code += 'sleep(' + time + ')\n';
    code += 'create.drive_direct(0, 0)\n\n';
    return code;
};
