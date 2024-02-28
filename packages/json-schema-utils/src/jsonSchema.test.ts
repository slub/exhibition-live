import { isPrimitive, filterForPrimitiveProperties } from './jsonSchema';
import {JSONSchema7} from "json-schema";

describe('JSON Schema Utility Functions', () => {
  describe('isPrimitive', () => {
    test.each([
      ['string', true],
      ['number', true],
      ['integer', true],
      ['boolean', true],
      ['object', false],
      [undefined, false],
    ])('should return %s for %p type', (type, expected) => {
      expect(isPrimitive(type)).toBe(expected);
    });
  });

  describe('filterForPrimitiveProperties', () => {
    const properties = {
      name: { type: 'string' },
      age: { type: 'number' },
      address: { type: 'object' },
      tags: { type: 'array', items: { type: 'string' } },
      knows: { type: 'array', items: { type: 'object', properties: {} } },
    } as JSONSchema7['properties'];

    test('should filter out non-primitive properties', () => {
      const filteredProperties = filterForPrimitiveProperties(properties);
      expect(filteredProperties).toEqual({
        name: { type: 'string' },
        age: { type: 'number' },
        tags: { type: 'array', items: { type: 'string' } },
      });
    });
  });
});
