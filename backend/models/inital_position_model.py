from backend.core import mongo


def filtered_average_position():
    """
    Queries the list of activities for the average position, using the start and end of all activities as input.
    Positions are then aggressively filtered to remove outliers (> std_dev from the mean), then re-averaged.
    The main use-case for this is to find a likely start position for the map.
    """

    agg_query = [
        {
            # Extract just the positions we're interested in from the collection as start/end pairs (one each for
            # lat and lng).
            '$project': {
                'lats': [
                    {'$arrayElemAt': ['$start_latlng', 0]},
                    {'$arrayElemAt': ['$end_latlng', 0]}
                ],
                'lngs': [
                    {'$arrayElemAt': ['$start_latlng', 1]},
                    {'$arrayElemAt': ['$end_latlng', 1]}
                ]
            }
        }, {
            # Gather all pairs into a single document
            '$group': {
                '_id': None,
                'lats': {'$push': '$lats'},
                'lngs': {'$push': '$lngs'}
            }
        }, {
            # Flatten the start/end pairs into long arrays of all lats, lngs respectively
            '$project': {
                'positions': {
                    '$map': {
                        'input': ['$lats', '$lngs'],
                        'as': 'arr',
                        'in': {
                            '$reduce': {
                                'input': '$$arr',
                                'initialValue': [],
                                'in': {'$concatArrays': ['$$value', '$$this']}
                            }
                        }
                    }
                }
            }
        }, {
            # Calculate the average and std devs across the lats and lngs individually, in preparation for filtering
            '$project': {
                'avgs': {'$map': {
                    'input': [0, 1],
                    'as': 'idx',
                    'in': {'$avg': {'$arrayElemAt': ['$positions', '$$idx']}}
                }},
                'stds': {'$map': {
                    'input': [0, 1],
                    'as': 'idx',
                    'in': {'$stdDevPop': {'$arrayElemAt': ['$positions', '$$idx']}}
                }},
                'positions': 1
            }
        }, {
            # Calculate the upper and lower bounds for valid lat/long (mean +/ std_dev)
            '$project': {
                'low_bounds': {'$map': {
                    'input': [0, 1],
                    'as': 'idx',
                    'in': {
                        '$subtract': [
                            {'$arrayElemAt': ['$avgs', '$$idx']},
                            {'$arrayElemAt': ['$stds', '$$idx']}
                        ]
                    }
                }},
                'high_bounds': {'$map': {
                    'input': [0, 1],
                    'as': 'idx',
                    'in': {
                        '$add': [
                            {'$arrayElemAt': ['$avgs', '$$idx']},
                            {'$arrayElemAt': ['$stds', '$$idx']}
                        ]
                    }
                }},
                'positions': 1
            }
        }, {
            # For lat and lng, filter out any values outside the valid lat/lng bounds (note: this could mean we
            # have different numbers of lats vs lngs as the relationship between the coords is broken. I'm not
            # convinced this matters in this case.
            '$project': {
                'positions': {'$map': {
                    'input': [0, 1],
                    'as': 'idx',
                    'in': {
                        '$filter': {
                            'input': {'$arrayElemAt': ['$positions', '$$idx']},
                            'as': 'val',
                            'cond': {'$and': [
                                {'$gte': ['$$val', {'$arrayElemAt': ['$low_bounds', '$$idx']}]},
                                {'$lte': ['$$val', {'$arrayElemAt': ['$high_bounds', '$$idx']}]}
                            ]}
                        }
                    }
                }}
            }
        }, {
            # Calculate the new average from the filtered set
            '$project': {
                'avg_pos': {'$map': {
                    'input': [0, 1],
                    'as': 'idx',
                    'in': {'$avg': {'$arrayElemAt': ['$positions', '$$idx']}}
                }}
            }
        }
    ]

    db = mongo.factory.default_client()
    cur = db.activities.aggregate(agg_query)

    # Guaranteed to only return a single document
    return cur.next()
