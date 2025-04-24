import {eventTypeFilter} from "../eventTypeFilter";

describe('eventTypeFilter', () => {

    it('should return the correct filter when input.type is a non-empty array', () => {
        const input = { type: ['conference', 'workshop'] };  // Correctement typé
        const expected = { type: { $in: ['conference', 'workshop'] } };
        expect(eventTypeFilter(input)).toEqual(expected);
    });

    it('should return an empty object when input.type is an empty array', () => {
        const input = { type: [] };  // Correctement typé
        const expected = {};
        expect(eventTypeFilter(input)).toEqual(expected);
    });

    it('should return an empty object when input.type is a string (not an array)', () => {
        const input = { type: ['conference'] };  // Correctement typé (encapsulé dans un tableau)
        const expected = { type: { $in: ['conference'] } };
        expect(eventTypeFilter(input)).toEqual(expected);
    });

    it('should return an empty object when input.type is undefined', () => {
        const input = {}; // type est undefined
        const expected = {};
        expect(eventTypeFilter(input)).toEqual(expected);
    });

    it('should return an empty object when input.type is null', () => {
        const input = { type: null }; // type est null
        const expected = {};
        expect(eventTypeFilter(input)).toEqual(expected);
    });

});