import {mapKeys, sortBy} from 'lodash';
import {DateTime} from 'luxon';

const COLUMN_NAMES: Record<string, string> = {
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

export enum TimeType {
    NONE = 'NONE',
    PEAK = 'PEAK',
    OFF_PEAK = 'OFF_PEAK',
    WEEKEND = 'WEEKEND'
}

export const TIME_TYPE_NAMES: Record<TimeType, string> = {
    [TimeType.NONE]: 'None',
    [TimeType.PEAK]: 'Peak',
    [TimeType.OFF_PEAK]: 'Off-peak',
    [TimeType.WEEKEND]: 'Weekend'
};

export interface Transaction {
    date: string;
    start: DateTime;
    end: DateTime;
    type: string;
    debit: string;
    credit: string;
    departue: string;
    destination: string;
    class: string;
    product: string;
    privateOrBusiness: string;
    timeType: TimeType;
}

const getTimeType = (date: DateTime, product: string): TimeType => {
    if (!product.toLowerCase().includes('trein')) {
        return TimeType.NONE;
    }
    if (date.weekday >= 6) {
        return TimeType.WEEKEND;
    }
    if (date.hour === 6 && date.minute >= 30) {
        return TimeType.PEAK;
    }
    if (date.hour > 6 && date.hour < 9) {
        return TimeType.PEAK;
    }
    if (date.hour >= 16 && date.hour < 18) {
        return TimeType.PEAK;
    }
    if (date.hour === 18 && date.minute < 30) {
        return TimeType.PEAK;
    }
    return TimeType.OFF_PEAK;
};

export const parseTransactions = (rows: Record<string, string>[]) =>
    sortBy(
        rows
            .map((row) => mapKeys(row, (_, key) => COLUMN_NAMES[key] ?? key))
            .filter((row) => 'type' in row)
            .map((row) => {
                const start = DateTime.fromFormat(`${row.date} ${row.startTime}`, 'd-M-y H:m');
                const end = DateTime.fromFormat(`${row.date} ${row.endTime}`, 'd-M-y H:m');

                return {
                    ...row,
                    start,
                    end,
                    debit: parseFloat(row.debit.substring(1).replace(',', '.')),
                    credit: parseFloat(row.credit.substring(1).replace(',', '.')),
                    class: parseInt(row.class),
                    timeType: getTimeType(start, row.product)
                } as unknown as Transaction;
            }),
        'date',
        'startTime'
    );
