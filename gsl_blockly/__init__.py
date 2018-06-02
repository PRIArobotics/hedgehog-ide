from gsl.yaml import YAML


def get_model(model_file, msg_model_file):
    with open(model_file) as f, open(msg_model_file) as msg_f:
        yaml = YAML(typ='safe')
        model = yaml.load(f)
        msg_model = yaml.load(msg_f)
        msg_modules = {module.name: module.langs for module in msg_model.modules}
        for module in model.modules:
            if module.name in msg_modules:
                module.langs = msg_modules[module.name]
        return model


def main():
    from . import blockly_target

    model = get_model('gsl_blockly/blockly.yaml', 'gsl_blockly/blockly_msgs.yaml')
    root = '.'
    blockly_target.generate_code(model, root)
