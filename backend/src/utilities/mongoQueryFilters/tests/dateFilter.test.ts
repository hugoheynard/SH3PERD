import {dateFilter} from "../dateFilterQuery";


describe('dateFilter', () => {

    // Test pour un input.date
    it('should return a date range for a specific date', () => {
        const input = { date: new Date('2024-11-25') };
        const result = dateFilter(input);
        const start = new Date(Date.UTC(2024, 10, 25, 0, 0, 0, 0)); // 2024-11-25 00:00:00 UTC
        const end = new Date(Date.UTC(2024, 10, 25, 23, 59, 59, 999)); // 2024-11-25 23:59:59.999 UTC

        // Vérifier que le résultat correspond à la plage attendue
        expect(result.date.$gte).toEqual(start);
        expect(result.date.$lte).toEqual(end);
    });

    // Test pour un input.startDate et input.endDate
    it('should return a date range for startDate and endDate', () => {
        const input = { startDate: new Date('2024-11-20'), endDate: new Date('2024-11-25') };
        const result = dateFilter(input);

        const start = new Date(Date.UTC(2024, 10, 20, 0, 0, 0, 0)); // 2024-11-20 00:00:00 UTC
        const end = new Date(Date.UTC(2024, 10, 25, 23, 59, 59, 999)); // 2024-11-25 23:59:59.999 UTC

        // Vérifier que le résultat correspond à la plage attendue
        expect(result.date.$gte).toEqual(start);
        expect(result.date.$lte).toEqual(end);
    });


});