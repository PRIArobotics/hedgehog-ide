'use strict';

goog.provide('Blockly.Python.hedgehog');

goog.require('Blockly.Python');

// set indentaion to 4 spaces
Blockly.Python.INDENT = '    ';

// <GSL customizable: module-extras>
function importHedgehog() {
    Blockly.Python.definitions_['import_hedgehog'] = 'from hedgehog.client import connect, motor';
}

function importSleep() {
    Blockly.Python.definitions_['import_sleep'] = 'from time import sleep';
}

function importCreate() {
    Blockly.Python.definitions_['import_create'] = 'from hedgehog.client import connect_create';
}

function importCreate2() {
    Blockly.Python.definitions_['import_create2'] = 'from hedgehog.client import connect_create2';
}
// </GSL customizable: module-extras>

Blockly.Python['hedgehog_scope'] = function(block) {
    let statements = Blockly.Python.statementToCode(block, 'IN');
    // <GSL customizable: hedgehog_scope-body>
    importHedgehog();

    let code = 'with connect(emergency=15) as hedgehog:\n' + statements;
    return code;
    // </GSL customizable: hedgehog_scope-body>
};

Blockly.Python['hedgehog_move'] = function(block) {
    let port = block.getFieldValue('PORT');
    // <GSL customizable: hedgehog_move-body>
    let speed = Blockly.Python.valueToCode(block, 'SPEED', Blockly.Python.ORDER_NONE);
    let time = Blockly.Python.valueToCode(block, 'TIME', Blockly.Python.ORDER_NONE);

    importSleep();

    let code = 'hedgehog.move_motor(' + port + ', ' + speed + ')\n';
    code += 'sleep(' + time + ')\n';
    code += 'hedgehog.brake(' + port + ')\n\n';
    return code;
    // </GSL customizable: hedgehog_move-body>
};

Blockly.Python['hedgehog_move_unlimited'] = function(block) {
    let port = block.getFieldValue('PORT');
    // <GSL customizable: hedgehog_move_unlimited-body>
    let speed = Blockly.Python.valueToCode(block, 'SPEED', Blockly.Python.ORDER_NONE);

    let code = 'hedgehog.move_motor(' + port + ', ' + speed + ')\n\n';
    return code;
    // </GSL customizable: hedgehog_move_unlimited-body>
};

Blockly.Python['hedgehog_motor_off'] = function(block) {
    let port = block.getFieldValue('PORT');
    // <GSL customizable: hedgehog_motor_off-body>
    let code = 'hedgehog.motor_off(' + port + ')\n\n';
    return code;
    // </GSL customizable: hedgehog_motor_off-body>
};

Blockly.Python['hedgehog_brake'] = function(block) {
    let port = block.getFieldValue('PORT');
    // <GSL customizable: hedgehog_brake-body>
    let code = 'hedgehog.brake(' + port + ')\n\n';
    return code;
    // </GSL customizable: hedgehog_brake-body>
};

Blockly.Python['hedgehog_move2'] = function(block) {
    let port1 = block.getFieldValue('PORT1');
    let port2 = block.getFieldValue('PORT2');
    // <GSL customizable: hedgehog_move2-body>
    let speed1 = Blockly.Python.valueToCode(block, 'SPEED1', Blockly.Python.ORDER_NONE);
    let speed2 = Blockly.Python.valueToCode(block, 'SPEED2', Blockly.Python.ORDER_NONE);
    let time = Blockly.Python.valueToCode(block, 'TIME', Blockly.Python.ORDER_NONE);

    importSleep();

    let code = '';
    code += 'hedgehog.commands(\n';
    code += '    hedgehog.move_motor_cmd(' + port1 + ', ' + speed1 + '),\n';
    code += '    hedgehog.move_motor_cmd(' + port2 + ', ' + speed2 + '),\n';
    code += ')\n';
    code += 'sleep(' + time + ')\n';
    code += 'hedgehog.commands(\n';
    code += '    hedgehog.brake_cmd(' + port1 + '),\n';
    code += '    hedgehog.brake_cmd(' + port2 + '),\n';
    code += ')\n\n';
    return code;
    // </GSL customizable: hedgehog_move2-body>
};

Blockly.Python['hedgehog_move2_unlimited'] = function(block) {
    let port1 = block.getFieldValue('PORT1');
    let port2 = block.getFieldValue('PORT2');
    // <GSL customizable: hedgehog_move2_unlimited-body>
    let speed1 = Blockly.Python.valueToCode(block, 'SPEED1', Blockly.Python.ORDER_NONE);
    let speed2 = Blockly.Python.valueToCode(block, 'SPEED2', Blockly.Python.ORDER_NONE);

    let code = '';
    code += 'hedgehog.commands(\n';
    code += '    hedgehog.move_motor_cmd(' + port1 + ', ' + speed1 + '),\n';
    code += '    hedgehog.move_motor_cmd(' + port2 + ', ' + speed2 + '),\n';
    code += ')\n\n';
    return code;
    // </GSL customizable: hedgehog_move2_unlimited-body>
};

Blockly.Python['hedgehog_forward'] = function(block) {
    let port1 = block.getFieldValue('PORT1');
    let port2 = block.getFieldValue('PORT2');
    // <GSL customizable: hedgehog_forward-body>
    let speed = Blockly.Python.valueToCode(block, 'SPEED', Blockly.Python.ORDER_NONE);
    let time = Blockly.Python.valueToCode(block, 'TIME', Blockly.Python.ORDER_NONE);

    importSleep();

    let code = '';
    code += 'hedgehog.commands(\n';
    code += '    hedgehog.move_motor_cmd(' + port1 + ', ' + speed + '),\n';
    code += '    hedgehog.move_motor_cmd(' + port2 + ', ' + speed + '),\n';
    code += ')\n';
    code += 'sleep(' + time + ')\n';
    code += 'hedgehog.commands(\n';
    code += '    hedgehog.brake_cmd(' + port1 + '),\n';
    code += '    hedgehog.brake_cmd(' + port2 + '),\n';
    code += ')\n\n';
    return code;
    // </GSL customizable: hedgehog_forward-body>
};

Blockly.Python['hedgehog_turn'] = function(block) {
    let port1 = block.getFieldValue('PORT1');
    let port2 = block.getFieldValue('PORT2');
    // <GSL customizable: hedgehog_turn-body>
    let dir = Blockly.Python.valueToCode(block, 'DIR', Blockly.Python.ORDER_NONE);
    let negDir = Blockly.Python.valueToCode(block, 'DIR', Blockly.Python.ORDER_UNARY_SIGN);
    let time = Blockly.Python.valueToCode(block, 'TIME', Blockly.Python.ORDER_NONE);

    importSleep();

    let code = '';
    code += 'hedgehog.commands(\n';
    code += '    hedgehog.move_motor_cmd(' + port1 + ', ' + dir + '),\n';
    code += '    hedgehog.move_motor_cmd(' + port2 + ', ' + '-' + negDir + '),\n';
    code += ')\n';
    code += 'sleep(' + time + ')\n';
    code += 'hedgehog.commands(\n';
    code += '    hedgehog.brake_cmd(' + port1 + '),\n';
    code += '    hedgehog.brake_cmd(' + port2 + '),\n';
    code += ')\n\n';
    return code;
    // </GSL customizable: hedgehog_turn-body>
};

Blockly.Python['hedgehog_motor_off2'] = function(block) {
    let port1 = block.getFieldValue('PORT1');
    let port2 = block.getFieldValue('PORT2');
    // <GSL customizable: hedgehog_motor_off2-body>
    let code = '';
    code += 'hedgehog.commands(\n';
    code += '    hedgehog.motor_off(' + port1 + '),\n';
    code += '    hedgehog.motor_off(' + port2 + '),\n';
    code += ')\n\n';
    return code;
    // </GSL customizable: hedgehog_motor_off2-body>
};

Blockly.Python['hedgehog_brake2'] = function(block) {
    let port1 = block.getFieldValue('PORT1');
    let port2 = block.getFieldValue('PORT2');
    // <GSL customizable: hedgehog_brake2-body>
    let code = '';
    code += 'hedgehog.commands(\n';
    code += '    hedgehog.brake_cmd(' + port1 + '),\n';
    code += '    hedgehog.brake_cmd(' + port2 + '),\n';
    code += ')\n\n';
    return code;
    // </GSL customizable: hedgehog_brake2-body>
};

Blockly.Python['hedgehog_servo'] = function(block) {
    let port = block.getFieldValue('PORT');
    // <GSL customizable: hedgehog_servo-body>
    let angle = Blockly.Python.valueToCode(block, 'ANGLE', Blockly.Python.ORDER_MULTIPLICATIVE);

    importSleep();

    let code = 'hedgehog.set_servo(' + port + ', int(' + angle + ' * 1000 / 180))\n';
    code += 'sleep(0.1)\n\n';
    return code;
    // </GSL customizable: hedgehog_servo-body>
};

Blockly.Python['hedgehog_servo_off'] = function(block) {
    let port = block.getFieldValue('PORT');
    // <GSL customizable: hedgehog_servo_off-body>
    let code = 'hedgehog.set_servo(' + port + ', None)\n\n';
    return code;
    // </GSL customizable: hedgehog_servo_off-body>
};

Blockly.Python['hedgehog_speaker'] = function(block) {
    // <GSL customizable: hedgehog_speaker-body>
    let frequency = Blockly.Python.valueToCode(block, 'FREQUENCY', Blockly.Python.ORDER_NONE);

    let code = 'hedgehog.set_speaker(' + frequency + ')\n\n';
    return code;
    // </GSL customizable: hedgehog_speaker-body>
};

Blockly.Python['hedgehog_speaker_off'] = function(block) {
    // <GSL customizable: hedgehog_speaker_off-body>

    let code = 'hedgehog.set_speaker(None)\n\n';
    return code;
    // </GSL customizable: hedgehog_speaker_off-body>
};

Blockly.Python['hedgehog_pullup'] = function(block) {
    let port = block.getFieldValue('PORT');
    let state = block.getFieldValue('STATE') === 'TRUE';
    // <GSL customizable: hedgehog_pullup-body>
    let code = 'hedgehog.set_input_state(' + port + ', ' + (state ? 'True' : 'False') + ')\n\n';
    return code;
    // </GSL customizable: hedgehog_pullup-body>
};

Blockly.Python['hedgehog_read_analog'] = function(block) {
    let port = block.getFieldValue('PORT');
    // <GSL customizable: hedgehog_read_analog-body>
    let code = 'hedgehog.get_analog(' + port + ')';
    return [code, Blockly.Python.ORDER_MEMBER];
    // </GSL customizable: hedgehog_read_analog-body>
};

Blockly.Python['hedgehog_read_digital'] = function(block) {
    let port = block.getFieldValue('PORT');
    // <GSL customizable: hedgehog_read_digital-body>
    let code = 'hedgehog.get_digital(' + port + ')';
    return [code, Blockly.Python.ORDER_MEMBER];
    // </GSL customizable: hedgehog_read_digital-body>
};

Blockly.Python['hedgehog_read_imu'] = function(block) {
    let type = block.getFieldValue('TYPE');
    let axis = block.getFieldValue('AXIS');
    // <GSL customizable: hedgehog_read_imu-body>

    type = type.toLowerCase();
    switch (axis) {
        case 'X': axis = '[0]'; break;
        case 'Y': axis = '[1]'; break;
        case 'Z': axis = '[2]'; break;
        case 'XYZ': axis = ''; break;
    }

    let code = 'hedgehog.get_imu_' + type +'()' + axis;
    return [code, Blockly.Python.ORDER_MEMBER];
    // </GSL customizable: hedgehog_read_imu-body>
};

Blockly.Python['hedgehog_sleep'] = function(block) {
    // <GSL customizable: hedgehog_sleep-body>
    let time = Blockly.Python.valueToCode(block, 'TIME', Blockly.Python.ORDER_NONE);

    importSleep();

    let code = 'sleep(' + time + ')\n\n';
    return code;
    // </GSL customizable: hedgehog_sleep-body>
};

Blockly.Python['hedgehog_create_scope'] = function(block) {
    let statements = Blockly.Python.statementToCode(block, 'IN');
    // <GSL customizable: hedgehog_create_scope-body>
    importCreate();

    let code = 'with connect_create() as create:\n';
    code += Blockly.Python.INDENT + 'create.safe()\n\n';
    code += statements;
    return code;
    // </GSL customizable: hedgehog_create_scope-body>
};

Blockly.Python['hedgehog_create2_scope'] = function(block) {
    let statements = Blockly.Python.statementToCode(block, 'IN');
    // <GSL customizable: hedgehog_create2_scope-body>
    importCreate2();

    let code = 'with connect_create2() as create:\n';
    code += Blockly.Python.INDENT + 'create.safe()\n\n';
    code += statements;
    return code;
    // </GSL customizable: hedgehog_create2_scope-body>
};

Blockly.Python['hedgehog_create_drive_direct'] = function(block) {
    // <GSL customizable: hedgehog_create_drive_direct-body>
    let time = Blockly.Python.valueToCode(block, 'TIME', Blockly.Python.ORDER_NONE);
    let lspeed = Blockly.Python.valueToCode(block, 'LSPEED', Blockly.Python.ORDER_NONE);
    let rspeed = Blockly.Python.valueToCode(block, 'RSPEED', Blockly.Python.ORDER_NONE);

    importSleep();

    let code = 'create.drive_direct(' + lspeed + ', ' + rspeed + ')\n';
    code += 'sleep(' + time + ')\n';
    code += 'create.drive_direct(0, 0)\n\n';
    return code;
    // </GSL customizable: hedgehog_create_drive_direct-body>
};

Blockly.Python['hedgehog_lego_motor_config'] = function(block) {
    let port = block.getFieldValue('PORT');
    // <GSL customizable: hedgehog_lego_motor_config-body>
    let code = 'hedgehog.configure_lego_motor(' + port + ')\n\n';
    return code;
    // </GSL customizable: hedgehog_lego_motor_config-body>
};

Blockly.Python['hedgehog_lego_sensor_config'] = function(block) {
    let port = block.getFieldValue('PORT');
    // <GSL customizable: hedgehog_lego_sensor_config-body>
    let code = 'hedgehog.configure_lego_sensor(' + port + ')\n\n';
    return code;
    // </GSL customizable: hedgehog_lego_sensor_config-body>
};

Blockly.Python['hedgehog_lego_move'] = function(block) {
    let port = block.getFieldValue('PORT');
    // <GSL customizable: hedgehog_lego_move-body>
    let speed = Blockly.Python.valueToCode(block, 'SPEED', Blockly.Python.ORDER_NONE);
    let time = Blockly.Python.valueToCode(block, 'TIME', Blockly.Python.ORDER_NONE);

    importSleep();

    let code = 'hedgehog.move_motor(' + port + ', ' + speed + ', motor.VELOCITY)\n';
    code += 'sleep(' + time + ')\n';
    code += 'hedgehog.brake(' + port + ')\n\n';
    return code;
    // </GSL customizable: hedgehog_lego_move-body>
};

Blockly.Python['hedgehog_lego_move_unlimited'] = function(block) {
    let port = block.getFieldValue('PORT');
    // <GSL customizable: hedgehog_lego_move_unlimited-body>
    let speed = Blockly.Python.valueToCode(block, 'SPEED', Blockly.Python.ORDER_NONE);

    let code = 'hedgehog.move_motor(' + port + ', ' + speed + ', motor.VELOCITY)\n\n';
    return code;
    // </GSL customizable: hedgehog_lego_move_unlimited-body>
};

Blockly.Python['hedgehog_lego_move2'] = function(block) {
    let port1 = block.getFieldValue('PORT1');
    let port2 = block.getFieldValue('PORT2');
    // <GSL customizable: hedgehog_lego_move2-body>
    let speed1 = Blockly.Python.valueToCode(block, 'SPEED1', Blockly.Python.ORDER_NONE);
    let speed2 = Blockly.Python.valueToCode(block, 'SPEED2', Blockly.Python.ORDER_NONE);
    let time = Blockly.Python.valueToCode(block, 'TIME', Blockly.Python.ORDER_NONE);

    importSleep();

    let code = '';
    code += 'hedgehog.commands(\n';
    code += '    hedgehog.move_motor_cmd(' + port1 + ', ' + speed1 + ', motor.VELOCITY),\n';
    code += '    hedgehog.move_motor_cmd(' + port2 + ', ' + speed2 + ', motor.VELOCITY),\n';
    code += ')\n';
    code += 'sleep(' + time + ')\n';
    code += 'hedgehog.commands(\n';
    code += '    hedgehog.brake_cmd(' + port1 + '),\n';
    code += '    hedgehog.brake_cmd(' + port2 + '),\n';
    code += ')\n\n';
    return code;
    // </GSL customizable: hedgehog_lego_move2-body>
};

Blockly.Python['hedgehog_lego_move2_unlimited'] = function(block) {
    let port1 = block.getFieldValue('PORT1');
    let port2 = block.getFieldValue('PORT2');
    // <GSL customizable: hedgehog_lego_move2_unlimited-body>
    let speed1 = Blockly.Python.valueToCode(block, 'SPEED1', Blockly.Python.ORDER_NONE);
    let speed2 = Blockly.Python.valueToCode(block, 'SPEED2', Blockly.Python.ORDER_NONE);

    let code = '';
    code += 'hedgehog.commands(\n';
    code += '    hedgehog.move_motor_cmd(' + port1 + ', ' + speed1 + ', motor.VELOCITY),\n';
    code += '    hedgehog.move_motor_cmd(' + port2 + ', ' + speed2 + ', motor.VELOCITY),\n';
    code += ')\n\n';
    return code;
    // </GSL customizable: hedgehog_lego_move2_unlimited-body>
};

Blockly.Python['hedgehog_lego_forward'] = function(block) {
    let port1 = block.getFieldValue('PORT1');
    let port2 = block.getFieldValue('PORT2');
    // <GSL customizable: hedgehog_lego_forward-body>
    let speed = Blockly.Python.valueToCode(block, 'SPEED', Blockly.Python.ORDER_NONE);
    let time = Blockly.Python.valueToCode(block, 'TIME', Blockly.Python.ORDER_NONE);

    importSleep();

    let code = '';
    code += 'hedgehog.commands(\n';
    code += '    hedgehog.move_motor_cmd(' + port1 + ', ' + speed + ', motor.VELOCITY),\n';
    code += '    hedgehog.move_motor_cmd(' + port2 + ', ' + speed + ', motor.VELOCITY),\n';
    code += ')\n';
    code += 'sleep(' + time + ')\n';
    code += 'hedgehog.commands(\n';
    code += '    hedgehog.brake_cmd(' + port1 + '),\n';
    code += '    hedgehog.brake_cmd(' + port2 + '),\n';
    code += ')\n\n';
    return code;
    // </GSL customizable: hedgehog_lego_forward-body>
};

Blockly.Python['hedgehog_lego_turn'] = function(block) {
    let port1 = block.getFieldValue('PORT1');
    let port2 = block.getFieldValue('PORT2');
    // <GSL customizable: hedgehog_lego_turn-body>
    let dir = Blockly.Python.valueToCode(block, 'DIR', Blockly.Python.ORDER_NONE);
    let negDir = Blockly.Python.valueToCode(block, 'DIR', Blockly.Python.ORDER_UNARY_SIGN);
    let time = Blockly.Python.valueToCode(block, 'TIME', Blockly.Python.ORDER_NONE);

    importSleep();

    let code = '';
    code += 'hedgehog.commands(\n';
    code += '    hedgehog.move_motor_cmd(' + port1 + ', ' + dir + ', motor.VELOCITY),\n';
    code += '    hedgehog.move_motor_cmd(' + port2 + ', ' + '-' + negDir + ', motor.VELOCITY),\n';
    code += ')\n';
    code += 'sleep(' + time + ')\n';
    code += 'hedgehog.commands(\n';
    code += '    hedgehog.brake_cmd(' + port1 + '),\n';
    code += '    hedgehog.brake_cmd(' + port2 + '),\n';
    code += ')\n\n';
    return code;
    // </GSL customizable: hedgehog_lego_turn-body>
};

// <GSL customizable: extra-blocks>

// Default parameter blocks
Blockly.Python['hedgehog_speed'] = function(block) {
    let speed = block.getFieldValue('SPEED');
    return [speed, speed >= 0 ? Blockly.Python.ORDER_ATOMIC : Blockly.Python.ORDER_UNARY_SIGN];
};

Blockly.Python['hedgehog_dir'] = function(block) {
    let speed = block.getFieldValue('DIR');
    return [speed, speed >= 0 ? Blockly.Python.ORDER_ATOMIC : Blockly.Python.ORDER_UNARY_SIGN];
};

Blockly.Python['hedgehog_degrees'] = function(block) {
    let angle = block.getFieldValue('ANGLE');
    return [angle, Blockly.Python.ORDER_ATOMIC];
};
// </GSL customizable: extra-blocks>
