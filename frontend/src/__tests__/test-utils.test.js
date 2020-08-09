import {createMockActivity, createMockActivityArray, randomString} from "../test-utils";

describe("test the mock activity helper itself", () => {
    it("should produce a random activities with unique values", () => {
        const numActivities = 10;
        const activities = createMockActivityArray(numActivities);

        expect(activities.length).toEqual(numActivities);
        expect(activities).toBeDistinct()
    });

    it("should support proviude the required fields by default", () => {
        const a = createMockActivity();
        expect(a).toHaveProperty("name");
        expect(a).toHaveProperty("average_speed");
        expect(a).toHaveProperty("distance");
        expect(a).toHaveProperty("workout_type");
        expect(a).toHaveProperty("start_date");
    });

    it("should support overriding given fields", () => {
        const expectedName = randomString();

        const a = createMockActivity({name: expectedName});
        expect(a).toHaveProperty("name");
        expect(a.name).toEqual(expectedName);
        expect(a).toHaveProperty("average_speed");
        expect(a).toHaveProperty("distance");
        expect(a).toHaveProperty("workout_type");
        expect(a).toHaveProperty("start_date");
        expect(a).toHaveProperty("total_elevation_gain");
        expect(a).toHaveProperty("moving_time");

        const b = createMockActivity({anotherField: expectedName});
        expect(b).toHaveProperty("name");
        expect(b).toHaveProperty("average_speed");
        expect(b).toHaveProperty("distance");
        expect(b).toHaveProperty("workout_type");
        expect(b).toHaveProperty("start_date");
        expect(a).toHaveProperty("total_elevation_gain");
        expect(a).toHaveProperty("moving_time");
        expect(b).toHaveProperty("anotherField");
        expect(b.anotherField).toEqual(expectedName);
    });
});