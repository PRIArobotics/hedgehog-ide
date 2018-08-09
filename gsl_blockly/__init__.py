from gsl.yaml import YAML


def get_model(model_file, msg_model_file):
    with open(model_file) as f, open(msg_model_file) as msg_f:
        yaml = YAML(typ='safe')
        model = yaml.load(f)
        msg_model = yaml.load(msg_f)

    def augment_module(name, mod):
        def augment_block(name, block):
            block.name = name
            return block

        def augment_lang(key, lang):
            def augment_block(name, block):
                block.name = name
                return block

            blocks = [augment_block(*pair) for pair in lang.items()]
            lang.clear()
            lang.key = key
            lang.blocks = blocks

            return lang

        blocks = [augment_block(*pair) for pair in mod.items()]
        mod.clear()
        mod.name = name
        mod.blocks = blocks
        if name in msg_model.modules:
            mod.langs = [augment_lang(*pair) for pair in msg_model.modules[name].items()]

        return mod

    model.modules = [augment_module(*pair) for pair in model.modules.items()]

    return model


def main():
    from . import blockly_target

    model = get_model('gsl_blockly/blockly.yaml', 'gsl_blockly/blockly_msgs.yaml')
    root = '.'
    blockly_target.generate_code(model, root)
