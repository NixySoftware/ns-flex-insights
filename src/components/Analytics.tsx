import {groupBy, mapValues, sortBy, sumBy} from 'lodash';

import {TIME_TYPE_NAMES, TimeType, type Transaction} from '~/transaction';
import {CURRENCY_FORMAT} from '~/util';

export interface AnalyticsProps {
    transactions: Transaction[];
}

export const Analytics: React.FC<AnalyticsProps> = ({transactions}) => {
    const startDate = transactions.at(0)!.start;
    const endDate = transactions.at(-1)!.start;

    const transactionsByTimeType = groupBy(transactions, 'timeType') as Record<TimeType, Transaction[] | undefined>;

    const debit = sumBy(transactions, 'debit');
    const credit = sumBy(transactions, 'credit');
    const total = credit - debit;

    const debitByTimeType = mapValues(transactionsByTimeType, (transactions) => sumBy(transactions, 'debit'));
    const creditByTimeType = mapValues(transactionsByTimeType, (transactions) => sumBy(transactions, 'credit'));
    const totalByTimeType = mapValues(
        transactionsByTimeType,
        (transactions) => sumBy(transactions, 'credit') - sumBy(transactions, 'debit')
    );

    console.log(sortBy(transactionsByTimeType[TimeType.NONE] ?? [], 'debit').reverse());

    return (
        <>
            <div>
                <h2 className="font-medium leading-6 text-gray-900">Period</h2>
                {startDate.toFormat('dd-MM-yyyy')} - {endDate.toFormat('dd-MM-yyyy')}
            </div>
            <div>
                <h2 className="font-medium leading-6 text-gray-900">Amount of transactions</h2>
                {transactions.length}
            </div>
            <div>
                <h2 className="font-medium leading-6 text-gray-900">Debit</h2>
                {CURRENCY_FORMAT.format(debit)}
            </div>
            <div>
                <h2 className="font-medium leading-6 text-gray-900">Credit</h2>
                {CURRENCY_FORMAT.format(credit)}
            </div>
            <div>
                <h2 className="font-medium leading-6 text-gray-900">Total</h2>
                {CURRENCY_FORMAT.format(total)}
            </div>
            <div>
                <h2 className="font-medium leading-6 text-gray-900">Amount of transactions by time type</h2>
                <ul className="list-inside list-disc">
                    {Object.values(TimeType).map((timeType) => (
                        <li key={timeType}>
                            {TIME_TYPE_NAMES[timeType]}: {transactionsByTimeType[timeType]?.length ?? 0}
                        </li>
                    ))}
                </ul>
            </div>
            <div>
                <h2 className="font-medium leading-6 text-gray-900">Debit by time type</h2>
                <ul className="list-inside list-disc">
                    {Object.values(TimeType).map((timeType) => (
                        <li key={timeType}>
                            {TIME_TYPE_NAMES[timeType]}: {CURRENCY_FORMAT.format(debitByTimeType[timeType] ?? 0)}
                        </li>
                    ))}
                </ul>
            </div>
            <div>
                <h2 className="font-medium leading-6 text-gray-900">Credit by time type</h2>
                <ul className="list-inside list-disc">
                    {Object.values(TimeType).map((timeType) => (
                        <li key={timeType}>
                            {TIME_TYPE_NAMES[timeType]}: {CURRENCY_FORMAT.format(creditByTimeType[timeType] ?? 0)}
                        </li>
                    ))}
                </ul>
            </div>
            <div>
                <h2 className="font-medium leading-6 text-gray-900">Total by time type</h2>
                <ul className="list-inside list-disc">
                    {Object.values(TimeType).map((timeType) => (
                        <li key={timeType}>
                            {TIME_TYPE_NAMES[timeType]}: {CURRENCY_FORMAT.format(totalByTimeType[timeType] ?? 0)}
                        </li>
                    ))}
                </ul>
            </div>
        </>
    );
};
