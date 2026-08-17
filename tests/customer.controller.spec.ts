/// <reference types="jest" />
import { validateCustomerFields, normalizeText } from '../src/modules/customers/customer.controller';

describe('normalizeText', () => {
  it('trims, lowercases and removes diacritics', () => {
    expect(normalizeText('  ÑaMe Á ')).toBe('name a');
  });
});

describe('validateCustomerFields', () => {
  const valid = {
    typeId: 'cedula de ciudadania',
    identification: '12345678',
    name: 'Juan Perez',
    age: 30,
    email: 'juan@example.com',
    product: 'cuenta de ahorros',
  } as const;

  it('returns no errors for valid input and normalizes fields', () => {
    const res = validateCustomerFields(
      valid.typeId,
      valid.identification,
      valid.name,
      valid.age,
      valid.email,
      valid.product
    );

    expect(res.errors).toHaveLength(0);
    expect(res.normalizedTypeId).toBe('cedula de ciudadania');
    expect(res.normalizedIdentification).toBe('12345678');
    expect(res.normalizedName).toBe('Juan Perez');
    expect(res.normalizedAge).toBe(30);
    expect(res.normalizedEmail).toBe('juan@example.com');
    expect(res.normalizedProduct).toBe('cuenta de ahorros');
  });

  it('returns errors for invalid fields', () => {
    const res = validateCustomerFields('invalid', 'abc', 'a', 200, 'bad', 'x');
    expect(res.errors.length).toBeGreaterThan(0);
    expect(res.errors).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/tipo de identificación/i),
        expect.stringMatching(/identificación/i),
        expect.stringMatching(/nombre/i),
        expect.stringMatching(/edad/i),
        expect.stringMatching(/correo/i),
        expect.stringMatching(/producto/i),
      ])
    );
  });
});
