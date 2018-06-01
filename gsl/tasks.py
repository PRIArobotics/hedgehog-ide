from invoke import task


@task
def gsl_blockly(context):
    from blockly import get_model, blockly_target

    model = get_model('blockly/blockly.yaml', 'blockly/blockly_msgs.yaml')
    root = '../'
    blockly_target.generate_code(model, root)
