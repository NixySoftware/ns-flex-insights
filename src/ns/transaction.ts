import {mapKeys} from 'lodash';
import {DateTime} from 'luxon';

export enum TransactionType {
    BIKE_RENTAL = 'BIKE_RENTAL',
    BIKE_PARKING = 'BIKE_PARKING',
    BUS_METRO_TRAM = 'BUS_METRO_TRAM',
    SUPPLEMENT = 'SUPPLEMENT',
    TRAIN = 'TRAIN'
}

export const TRANSACTION_TYPE_NAMES: Record<TransactionType, string> = {
    [TransactionType.BIKE_RENTAL]: 'Bike rental',
    [TransactionType.BIKE_PARKING]: 'Bike parking',
    [TransactionType.BUS_METRO_TRAM]: 'Bus, metro, tram',
    [TransactionType.SUPPLEMENT]: 'Supplement',
    [TransactionType.TRAIN]: 'Train'
};

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
    type: TransactionType;
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
    rows
        .map((row) => mapKeys(row, (_, key) => COLUMN_NAMES[key] ?? key))
        .map((row) => {
            if (row.startTime.length > 0 && row.endTime.length === 0) {
                row.endTime = row.startTime;
            }

            const start = DateTime.fromFormat(`${row.date} ${row.startTime.substring(0, 5)}`, 'd-M-y H:m');
            const end = DateTime.fromFormat(`${row.date} ${row.endTime.substring(0, 5)}`, 'd-M-y H:m');

            const debit = parseFloat(row.debit.substring(1).replace(',', '.')) * 100;
            const credit = parseFloat(row.credit.substring(1).replace(',', '.')) * 100;

            return {
                ...row,
                start,
                end,
                type: getTransactionType(row.type.toLowerCase(), row.product.toLowerCase()),
                debit,
                credit,
                total: debit - credit,
                class: parseInt(row.class),
                timeType: getTimeType(start, row.product.toLowerCase())
            } as unknown as Transaction;
        })
        .filter((row) => {
            if (row.type === undefined) {
                return false;
            }
            if (row.start.invalidReason) {
                console.error(row.start.invalidReason, row.start.invalidExplanation, row);
            }
            if (row.end.invalidReason) {
                console.error(row.end.invalidReason, row.end.invalidExplanation, row);
            }
            return !row.start.invalidReason && !row.end.invalidReason;
        })
        .sort((a, b) => ((a.start.toISO() ?? '') < (b.start.toISO() ?? '') ? -1 : 1));

export const getTransactionType = (type: string, product: string) => {
    if (type === 'deur tot deur') {
        if (['ov fiets'].includes(product)) {
            return TransactionType.BIKE_RENTAL;
        }
        if (['ns fiets'].includes(product)) {
            return TransactionType.BIKE_PARKING;
        }
    }
    if (type === 'reis') {
        if (['treinreizen', 'reizen op rekening trein'].includes(product)) {
            return TransactionType.TRAIN;
        }
        if (['bus, tram en metro reizen'].includes(product)) {
            return TransactionType.BUS_METRO_TRAM;
        }
    }

    if (type === 'product op de kaart laden' && product.includes('toeslag')) {
        return TransactionType.SUPPLEMENT;
    }

    return undefined;
};

const HOLIDAYS: Record<string | number, string[] | undefined> = {
    fallback: ['01-01', '25-12', '26-12'],
    2023: ['01-01', '07-04', '09-04', '10-04', '27-04', '18-05', '28-05', '29-05', '25-12', '26-12']
};

const getTimeType = (date: DateTime, product: string): TimeType => {
    if (!product.includes('trein')) {
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
