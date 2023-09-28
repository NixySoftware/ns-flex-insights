import {mapKeys, sortBy} from 'lodash';
import {DateTime} from 'luxon';

export enum TimeType {
    NONE = 'NONE',
    PEAK = 'PEAK',
    OFF_PEAK = 'OFF_PEAK',
    WEEKEND = 'WEEKEND',
    HOLIDAY = 'HOLIDAY'
}

export const TIME_TYPE_NAMES: Record<TimeType, string> = {
    [TimeType.NONE]: 'None',
    [TimeType.PEAK]: 'Peak',
    [TimeType.OFF_PEAK]: 'Off-peak',
    [TimeType.WEEKEND]: 'Weekend',
    [TimeType.HOLIDAY]: 'Holiday'
};

export interface Transaction {
    date: string;
    start: DateTime;
    end: DateTime;
    type: string;
    debit: number;
    credit: number;
    total: number;
    departue: string;
    destination: string;
    class: string;
    product: string;
    privateOrBusiness: string;
    timeType: TimeType;
}

const COLUMN_NAMES: Record<string, string | undefined> = {
    Af: 'debit',
    Bestemming: 'destination',
    Bij: 'credit',
    Checkin: 'startTime',
    Checkuit: 'endTime',
    Datum: 'date',
    Kl: 'class',
    Opmerking: 'remark',
    'Prive/Zakelijk': 'privateOrBusiness',
    Product: 'product',
    Transactie: 'type',
    Vertrek: 'departure'
};

export const parseTransactions = (rows: Record<string, string>[]) =>
    sortBy(
        rows
            .map((row) => mapKeys(row, (_, key) => COLUMN_NAMES[key] ?? key))
            .filter((row) => 'type' in row)
            .map((row) => {
                const start = DateTime.fromFormat(`${row.date} ${row.startTime}`, 'd-M-y H:m');
                const end = DateTime.fromFormat(`${row.date} ${row.endTime}`, 'd-M-y H:m');

                const debit = parseFloat(row.debit.substring(1).replace(',', '.')) * 100;
                const credit = parseFloat(row.credit.substring(1).replace(',', '.')) * 100;

                return {
                    ...row,
                    start,
                    end,
                    debit,
                    credit,
                    total: credit - debit,
                    class: parseInt(row.class),
                    timeType: getTimeType(start, row.product)
                } as unknown as Transaction;
            }),
        'date',
        'startTime'
    );

const HOLIDAYS: Record<string | number, string[] | undefined> = {
    fallback: ['01-01', '25-12', '26-12'],
    2023: ['01-01', '07-04', '09-04', '10-04', '27-04', '18-05', '28-05', '29-05', '25-12', '26-12']
};

const getTimeType = (date: DateTime, product: string): TimeType => {
    if (!product.toLowerCase().includes('trein')) {
        return TimeType.NONE;
    }

    const holidays = HOLIDAYS[date.year] ?? HOLIDAYS.fallback;
    if (date.hour === 23 && date.minute >= 55 && holidays?.includes(date.minus({days: 1}).toFormat('dd-MM'))) {
        return TimeType.HOLIDAY;
    }
    if (holidays?.includes(date.toFormat('dd-MM'))) {
        return TimeType.HOLIDAY;
    }
    if (date.hour === 0 && date.minute < 5 && holidays?.includes(date.plus({days: 1}).toFormat('dd-MM'))) {
        return TimeType.HOLIDAY;
    }

    if (date.weekday === 5 && ((date.hour === 18 && date.minute >= 25) || date.hour >= 18)) {
        return TimeType.WEEKEND;
    }
    if (date.weekday >= 6) {
        return TimeType.WEEKEND;
    }
    if (date.weekday === 1 && (date.hour < 4 || (date.hour === 4 && date.minute < 5))) {
        return TimeType.WEEKEND;
    }

    if (date.hour === 6 && date.minute >= 35) {
        return TimeType.PEAK;
    }
    if (date.hour > 6 && date.hour < 8) {
        return TimeType.PEAK;
    }
    if (date.hour === 8 && date.minute < 55) {
        return TimeType.PEAK;
    }
    if (date.hour == 16 && date.minute >= 5) {
        return TimeType.PEAK;
    }
    if (date.hour > 16 && date.hour < 18) {
        return TimeType.PEAK;
    }
    if (date.hour === 18 && date.minute < 25) {
        return TimeType.PEAK;
    }

    return TimeType.OFF_PEAK;
};
