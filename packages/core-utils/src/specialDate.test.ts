import {getDatePart, getPaddedDate, getPaddedDatePart} from "./specialDate";

describe('Date Part Extraction and Formatting', () => {
  describe('getDatePart', () => {
    test('should extract the day from a numeric date', () => {
      expect(getDatePart(20210901, 'day')).toBe(1);
    });

    test('should extract the month from a numeric date', () => {
      expect(getDatePart(20210901, 'month')).toBe(9);
    });

    test('should extract the year from a numeric date', () => {
      expect(getDatePart(20210901, 'year')).toBe(2021);
    });
  });

  describe('getPaddedDatePart', () => {
    test('should return a padded day from a numeric date', () => {
      expect(getPaddedDatePart(20210901, 'day')).toBe('01');
    });

    test('should return a padded month from a numeric date', () => {
      expect(getPaddedDatePart(20210901, 'month')).toBe('09');
    });

    test('should return a padded year from a numeric date', () => {
      expect(getPaddedDatePart(20210901, 'year')).toBe('2021');
    });
  });

  describe('getPaddedDate', () => {
    test('should format a Date object into YYYYMMDD format', () => {
      const date = new Date('September 1, 2021');
      expect(getPaddedDate(date)).toBe('20210901');
    });
  });
});
