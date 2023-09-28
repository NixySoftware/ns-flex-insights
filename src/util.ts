export const CURRENCY_FORMAT = new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR'
});

export const formatCurrency = (amount: number) => CURRENCY_FORMAT.format(amount / 100);
