// Money value object: immutable, integer cents to avoid float errors.

export interface Money {
  readonly cents: number;
  readonly currency: string;
}

const DEFAULT_CURRENCY = 'USD' as const;

export const moneyFromDecimal = (amount: number, currency: string = DEFAULT_CURRENCY): Money => ({
  cents: Math.round(amount * 100),
  currency,
});

export const moneyFromCents = (cents: number, currency: string = DEFAULT_CURRENCY): Money => ({
  cents,
  currency,
});

export const moneyToDecimal = (money: Money): number => money.cents / 100;

export const moneyAdd = (a: Money, b: Money): Money => {
  if (a.currency !== b.currency) {
    throw new Error(`Currency mismatch: ${a.currency} vs ${b.currency}`);
  }
  return { cents: a.cents + b.cents, currency: a.currency };
};

export const moneyMultiply = (money: Money, quantity: number): Money => ({
  cents: money.cents * quantity,
  currency: money.currency,
});
