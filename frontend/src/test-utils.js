// https://gist.github.com/6174/6062387
export const randomString = () => Math.random()
    .toString(36)
    .substring(2, 15) + Math.random()
    .toString(36)
    .substring(2, 15);


// https://gist.github.com/miguelmota/5b67e03845d840c949c4
export const randomDate = (start, end) => {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

export const createMockActivity = (overrides) => ({
    name: randomString(),
    // Make sure we always generate a value > 0
    average_speed: 3 * Math.random() + 2,
    distance: 42.2 * Math.random() + Number.MIN_VALUE,
    workout_type: "Run",
    start_date: randomDate(new Date(2012, 0, 1), new Date()),
    total_elevation_gain: 250 * Math.random(),
    moving_time: 3000 * Math.random() + 600,
    ...overrides
});

export const createMockActivityArray = (num) => ([...Array(num).keys()]
    .reduce((acc, x) => {
        acc.push(createMockActivity());
        return acc;
    }, []));