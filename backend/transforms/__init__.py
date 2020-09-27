from . import distance_record_transform

transforms = [
    distance_record_transform
]


def register_transforms():
    distances = (5000, 10000, 160000, 21098, 42195)
    # Register 5km, 10km, 10mile, HM and Marathon distances
    for d in distances:
        distance_record_transform.register(d)
