import {groupBy, mapValues, sumBy} from 'lodash';

import {TIME_TYPE_NAMES, TimeType, type Transaction} from '~/ns';
import {formatCurrency} from '~/util';

export interface AnalyticsProps {
    transactions: Transaction[];
}

export const Analytics: React.FC<AnalyticsProps> = ({transactions}) => {
    const startDate = transactions.at(0)!.start;
    const endDate = transactions.at(-1)!.start;

    const transactionsByTimeType = groupBy(transactions, 'timeType') as Record<TimeType, Transaction[] | undefined>;

    const total = sumBy(transactions, 'total');
    const totalByTimeType = mapValues(
        transactionsByTimeType,
        (transactions) => sumBy(transactions, 'credit') - sumBy(transactions, 'debit')
    );

    console.log(transactions.filter((t) => t.product.toLowerCase().includes('trein')));

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
                <h2 className="font-medium leading-6 text-gray-900">Total</h2>
                {formatCurrency(total)}
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
                <h2 className="font-medium leading-6 text-gray-900">Total by time type</h2>
                <ul className="list-inside list-disc">
                    {Object.values(TimeType).map((timeType) => (
                        <li key={timeType}>
                            {TIME_TYPE_NAMES[timeType]}: {formatCurrency(totalByTimeType[timeType] ?? 0)}
                        </li>
                    ))}
                </ul>
            </div>
        </>
    );
};
