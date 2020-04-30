affirmative = ("true", "t", "yes", "y", "1")


def str_arg_is_true(arg):
    return arg is not None and str(arg).lower() in affirmative
