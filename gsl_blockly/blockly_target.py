import os.path
import json
import textwrap

from gsl import lines, generate


def js_string(s):
    return json.dumps(s, ensure_ascii=False)


def generate_code(model, root='.'):
    for mod in model.modules:
        generate_block_module_code(model, mod, root)
        generate_generator_module_code(model, mod, root)
        if 'langs' in mod:
            for lang in mod.langs:
                generate_msg_module_code(model, mod, lang, root)


def generate_block_module_code(model, mod, root):
    out_file = os.path.join(root, 'src/client/app/blockly/lib/blocks', f'{mod.name}.js')

    @generate(out_file)
    def code():
        def block_code(block):
            yield from lines(f"""\

Blockly.Blocks['{block.name}'] = {{
    init: function() {{
        this.jsonInit({{
            "message0": Blockly.Msg.{block.name.upper()},""")

            if 'args' in block:
                yield from lines(textwrap.indent(f"""\
"args0": {json.dumps(block.args, indent=4)},""", 12 * " "))

            if 'output' in block:
                yield from lines(f"""\
            "output": "{block.output}",""")
            else:
                if not block.get('scope', False):
                    yield from lines(f"""\
            "inputsInline": true,""")
                yield from lines(f"""\
            "previousStatement": null,
            "nextStatement": null,""")

            yield from lines(f"""\
            "tooltip": Blockly.Msg.{block.name.upper()}_TOOLTIP,
            "colour": Blockly.Blocks.hedgehog.HUE,
            "helpUrl": Blockly.Blocks.hedgehog.HELPURL
        }});
    }},""")
            if 'requiresScope' in block:
                yield from lines(f"""\
    onchange: requiresScope('{block.requiresScope}')""")
            yield from lines(f"""\
}};
""")

        yield from lines(f"""\
'use strict';

goog.provide('Blockly.Blocks.{mod.name}');

goog.require('Blockly.Blocks');


// <default GSL customizable: module-header>
// Common HSV hue for all blocks in this category.
Blockly.Blocks.hedgehog.HUE = 120;
Blockly.Constants.Loops.HUE = 120;

// Common Help URL for all blocks in this category
Blockly.Blocks.hedgehog.HELPURL = "https://hedgehog.pria.at/";
// </GSL customizable: module-header>

// <default GSL customizable: module-extras />
""")
        yield from lines("""\

function requiresScope(kind) {
    let scopeTypes, warning;
    // <default GSL customizable: requiresScope-scopes>
    // TODO initialize scopeTypes, warning according to kind
    // </GSL customizable: requiresScope-scopes>
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
""")
        for block in mod.blocks:
            yield from block_code(block)

        yield from lines("""\

// <default GSL customizable: extra-blocks />""")


def generate_generator_module_code(model, mod, root):
    out_file = os.path.join(root, 'src/client/app/blockly/lib/generators/python', f'{mod.name}.js')

    @generate(out_file)
    def code():
        def block_code(block):
            yield from lines(f"""\

Blockly.Python['{block.name}'] = function(block) {{""")
            if 'args' in block:
                for arg in block.args:
                    if arg.type == 'input_dummy':
                        continue
                    elif arg.type == 'input_statement':
                        yield from lines(f"""\
    let statements = Blockly.Python.statementToCode(block, {repr(arg.name)});""")
                    elif arg.type == 'field_checkbox':
                        yield from lines(f"""\
    let {arg.name.lower()} = block.getFieldValue({repr(arg.name)}) === 'TRUE';""")
                    elif arg.type.startswith('field_'):
                        yield from lines(f"""\
    let {arg.name.lower()} = block.getFieldValue({repr(arg.name)});""")

            yield from lines(f"""\
    // <default GSL customizable: {block.name}-body>""")
            if 'args' in block:
                for arg in block.args:
                    if arg.type not in {'input_dummy', 'input_statement'} and arg.type.startswith('input_'):
                        yield from lines(f"""\
    let {arg.name.lower()} = Blockly.Python.valueToCode(block, {repr(arg.name)}, Blockly.Python.ORDER_ATOMIC);""")
            yield from lines(f"""\

    let code = '';
    // TODO generate code""")
            if 'output' not in block:
                yield from lines(f"""\
    return code;""")
            else:
                yield from lines(f"""\
    return [code, Blockly.Python.ORDER_NONE];""")
            yield from lines(f"""\
    // </GSL customizable: {block.name}-body>
}};""")

        yield from lines(f"""\
'use strict';

goog.provide('Blockly.Python.{mod.name}');

goog.require('Blockly.Python');

// set indentaion to 4 spaces
Blockly.Python.INDENT = '    ';

// <default GSL customizable: module-extras />
""")

        for block in mod.blocks:
            yield from block_code(block)

        yield from lines("""\

// <default GSL customizable: extra-blocks />""")


def generate_msg_module_code(model, mod, lang, root):
    out_file = os.path.join(root, 'src/client/app/blockly/lib/msg/js', f'{lang.key}-{mod.name}.js')

    @generate(out_file)
    def code():
        def block_code(block):
            yield from lines(f"""\

Blockly.Msg.{block.name.upper()} = {js_string(block.msg)};""")
            if 'tooltip' in block:
                yield from lines(f"""\
Blockly.Msg.{block.name.upper()}_TOOLTIP = {js_string(block.tooltip)};""")

        yield from lines(f"""\
'use strict';

goog.provide('Blockly.Msg.{lang.key}.{mod.name}');

goog.require('Blockly.Msg');

// <default GSL customizable: module-extras />
""")

        for block in lang.blocks:
            yield from block_code(block)

        yield from lines("""\

// <default GSL customizable: extra-msgs />""")
