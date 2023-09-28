import {groupBy, mapValues, sumBy} from 'lodash';
import {useState} from 'react';

import {
    SUBSCRIPTION_TYPE_NAMES,
    SubscriptionType,
    TIME_TYPE_NAMES,
    TimeType,
    type Transaction,
    getBasePrice,
    getSubscriptionPrice
} from '~/ns';
import {formatCurrency} from '~/util';

export interface AnalyticsProps {
    transactions: Transaction[];
}

export const Analytics: React.FC<AnalyticsProps> = ({transactions}) => {
    const [subscriptionType, setSubscriptionType] = useState(SubscriptionType.BASIS);

    const startDate = transactions.at(0)!.start;
    const endDate = transactions.at(-1)!.start;

    const transactionsByTimeType = groupBy(transactions, 'timeType') as Record<TimeType, Transaction[] | undefined>;
    const transactionsWithBasePrice = transactions.map((transaction) => ({
        ...transaction,
        total: getBasePrice(transaction, subscriptionType)
    }));
    const transactionsWithSubscriptionPrice = Object.values(SubscriptionType).reduce(
        (prev, subscriptionType) => {
            prev[subscriptionType] = transactionsWithBasePrice.map((transaction) => ({
                ...transaction,
                total: getSubscriptionPrice(transaction, subscriptionType)
            }));
            return prev;
        },
        {} as Record<SubscriptionType, Transaction[]>
    );

    const total = sumBy(transactions, 'total');
    const totalByTimeType = mapValues(transactionsByTimeType, (transactions) => sumBy(transactions, 'total'));
    const totalWithBasePrice = sumBy(transactionsWithBasePrice, 'total');
    const totalWithSubscriptionPrice = mapValues(transactionsWithSubscriptionPrice, (transactions) =>
        sumBy(transactions, 'total')
    );

    console.log(transactions.filter((t) => t.product.toLowerCase().includes('trein')));

    return (
        <div className="mb-4 mb-6 grid grid-cols-2 gap-x-4 gap-y-2">
            <div>
                <h2 className="font-medium leading-6 text-gray-900">Period</h2>
                {startDate.toFormat('dd-MM-yyyy')} - {endDate.toFormat('dd-MM-yyyy')}
            </div>
            <div />
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
            <div>
                <label htmlFor="subscription-type" className="block font-medium leading-6 text-gray-900">
                    Current subscription type
                </label>
                <select
                    id="subscription-type"
                    name="subscriptionType"
                    className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    value={subscriptionType}
                    onChange={(event) => setSubscriptionType(event.target.value as SubscriptionType)}
                >
                    {Object.values(SubscriptionType).map((subscriptionType) => (
                        <option key={subscriptionType} value={subscriptionType}>
                            {SUBSCRIPTION_TYPE_NAMES[subscriptionType]}
                        </option>
                    ))}
                </select>
            </div>
            <div />
            <div>
                <h2 className="font-medium leading-6 text-gray-900">Total with subscription</h2>

                {[
                    SubscriptionType.WEEKEND_VRIJ,
                    SubscriptionType.WEEKEND_VRIJ_DALKORTING,
                    SubscriptionType.DAL_VRIJ,
                    SubscriptionType.ALTIJD_VRIJ
                ].includes(subscriptionType) && (
                    <p className="mb-2 italic">
                        The price of transactions with full discount can&apos;t be calculated, so the prices below are
                        (partially) incorrect.
                    </p>
                )}

                <ul className="list-inside list-disc">
                    {Object.values(SubscriptionType).map((subscriptionType) => (
                        <li key={subscriptionType}>
                            {SUBSCRIPTION_TYPE_NAMES[subscriptionType]}:{' '}
                            {formatCurrency(totalWithSubscriptionPrice[subscriptionType])}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};
