import {distanceFormat, secondsToHMS, speedToPaceMS} from "../ui";

describe("testing functions used for ui text formatting", () => {

    it.each`
        seconds    | expected      | shouldThrow
        ${5}       | ${'00:00:05'} | ${false}
        ${65}      | ${'00:01:05'} | ${false}
        ${599}     | ${'00:09:59'} | ${false}
        ${750}     | ${'00:12:30'} | ${false}
        ${3600}    | ${'01:00:00'} | ${false}
        ${3852}    | ${'01:04:12'} | ${false}
        ${-12}     | ${'N/A'} | ${true}
    `("should format seconds as H:M:S format with zero-padding", ({seconds, expected, shouldThrow}) => {
        if (!shouldThrow) {
            expect(secondsToHMS(seconds)).toEqual(expected);
        } else {
            expect(() => secondsToHMS(seconds)).toThrow("Number of seconds cannot be negative.");
        }
    });

    it.each`
        speed      | expected   | shouldThrow
        ${1}       | ${'16:40'} | ${false}
        ${2.5}     | ${'06:40'} | ${false}
        ${5}       | ${'03:20'} | ${false}
        ${0}       | ${NaN}     | ${false}
        ${-1}      | ${'N/A'}   | ${true}
    `("should speed in m/s to a zero-padded M:S string showing pace in mins/km", ({speed, expected, shouldThrow}) => {
        if (!shouldThrow) {
            expect(speedToPaceMS(speed)).toEqual(expected);
        } else {
            expect(() => speedToPaceMS(speed)).toThrow("Speed must be greater than 0.");
        }
    });

    it.each`
        metres      | expected
        ${0}        | ${'0.00'}   
        ${4}        | ${'0.00'}   
        ${5}        | ${'0.01'}   
        ${4000}     | ${'4.00'}
        ${300}      | ${'0.30'}
        ${12345}    | ${'12.35'}     
        ${12344}    | ${'12.34'}
    `("should convert a distance in metres to km, to 2 DP", ({metres, expected}) => {
        expect(distanceFormat(metres)).toEqual(expected);
    })

});