import {groupBy, mapValues, sumBy} from 'lodash';
import {DateTime} from 'luxon';
import {useMemo, useState} from 'react';

import {
    SUBSCRIPTION_MISSING_DATA,
    SUBSCRIPTION_TYPE_NAMES,
    SUBSCRIPTION_TYPE_PRICES,
    SubscriptionType,
    TIME_TYPE_NAMES,
    TRANSACTION_TYPE_NAMES,
    TimeType,
    type Transaction,
    TransactionType,
    getBasePrice,
    getSubscriptionPrice
} from '~/ns';
import {formatCurrency} from '~/util';

export interface AnalyticsProps {
    transactions: Transaction[];
}

export const Analytics: React.FC<AnalyticsProps> = ({transactions: allTransactions}) => {
    const [subscriptionType, setSubscriptionType] = useState(SubscriptionType.BASIS);

    const periodStartDate = allTransactions.at(0)!.start;
    const periodEndDate = allTransactions.at(-1)!.start;

    const [startDate, setStartDate] = useState(periodStartDate);
    const [endDate, setEndDate] = useState(periodEndDate);
    const months = Math.ceil(endDate.diff(startDate).as('months'));

    const transactions = useMemo(
        () => allTransactions.filter((transaction) => transaction.start >= startDate && transaction.start < endDate),
        [allTransactions, startDate, endDate]
    );

    const transactionsByTransactionType = groupBy(transactions, 'type') as Record<
        TransactionType,
        Transaction[] | undefined
    >;
    const transactionsByTimeType = groupBy(transactionsByTransactionType[TransactionType.TRAIN], 'timeType') as Record<
        TimeType,
        Transaction[] | undefined
    >;

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
    const totalWithSubscription = SUBSCRIPTION_TYPE_PRICES[subscriptionType][0] * months + total;
    const totalByTransactionType = mapValues(transactionsByTransactionType, (transactions) =>
        sumBy(transactions, 'total')
    );
    const totalByTimeType = mapValues(transactionsByTimeType, (transactions) => sumBy(transactions, 'total'));
    const totalWithSubscriptionPrice = mapValues(transactionsWithSubscriptionPrice, (transactions) =>
        sumBy(transactions, 'total')
    );

    return (
        <div className="mb-4 mb-6 grid grid-cols-2 gap-x-4 gap-y-2">
            <div>
                <h2 className="font-medium leading-6 text-gray-900">Total period</h2>
                {periodStartDate.toFormat('dd-MM-yyyy')} - {periodEndDate.toFormat('dd-MM-yyyy')}
            </div>
            <div>
                <h2 className="font-medium leading-6 text-gray-900">Total months</h2>
                {Math.ceil(periodEndDate.diff(periodStartDate).as('months'))}
            </div>
            <div>
                <label htmlFor="start-date" className="block font-medium leading-6 text-gray-900">
                    Start date
                </label>
                <div className="mt-2">
                    <input
                        id="start-date"
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        name="startDate"
                        type="date"
                        min={periodStartDate.toISODate() ?? ''}
                        max={periodEndDate.toISODate() ?? ''}
                        value={startDate.toISODate() ?? ''}
                        onChange={(event) => setStartDate(DateTime.fromISO(event.target.value))}
                    />
                </div>
            </div>
            <div>
                <label htmlFor="end-date" className="block  font-medium leading-6 text-gray-900">
                    End date
                </label>
                <div className="mt-2">
                    <input
                        id="end-date"
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        name="endDate"
                        type="date"
                        min={startDate.toISODate() ?? ''}
                        max={periodEndDate.toISODate() ?? ''}
                        value={endDate.toISODate() ?? ''}
                        onChange={(event) => setEndDate(DateTime.fromISO(event.target.value))}
                    />
                </div>
            </div>
            <div>
                <h2 className="font-medium leading-6 text-gray-900">Period</h2>
                {startDate.toFormat('dd-MM-yyyy')} - {endDate.toFormat('dd-MM-yyyy')}
            </div>
            <div>
                <h2 className="font-medium leading-6 text-gray-900">Months</h2>
                {months}
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
                <h2 className="font-medium leading-6 text-gray-900">Amount of transactions by transaction type</h2>
                <ul className="list-inside list-disc">
                    {Object.values(TransactionType).map((transactionType) => (
                        <li key={transactionType}>
                            {TRANSACTION_TYPE_NAMES[transactionType]}:{' '}
                            {transactionsByTransactionType[transactionType]?.length ?? 0}
                        </li>
                    ))}
                </ul>
            </div>
            <div>
                <h2 className="font-medium leading-6 text-gray-900">Total by transaction type</h2>
                <ul className="list-inside list-disc">
                    {Object.values(TransactionType).map((transactionType) => (
                        <li key={transactionType}>
                            {TRANSACTION_TYPE_NAMES[transactionType]}:{' '}
                            {formatCurrency(totalByTransactionType[transactionType] ?? 0)}
                        </li>
                    ))}
                </ul>
            </div>
            <div>
                <h2 className="font-medium leading-6 text-gray-900">Amount of transactions by train time type</h2>
                <ul className="list-inside list-disc">
                    {Object.values(TimeType)
                        .filter((timeType) => timeType !== TimeType.NONE)
                        .map((timeType) => (
                            <li key={timeType}>
                                {TIME_TYPE_NAMES[timeType]}: {transactionsByTimeType[timeType]?.length ?? 0}
                            </li>
                        ))}
                </ul>
            </div>
            <div>
                <h2 className="font-medium leading-6 text-gray-900">Total by train time type</h2>
                <ul className="list-inside list-disc">
                    {Object.values(TimeType)
                        .filter((timeType) => timeType !== TimeType.NONE)
                        .map((timeType) => (
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
                <h2 className="font-medium leading-6 text-gray-900">Subscription costs per month</h2>
                {formatCurrency(SUBSCRIPTION_TYPE_PRICES[subscriptionType][0])}
            </div>
            <div />
            <div>
                <h2 className="font-medium leading-6 text-gray-900">Total subscription costs</h2>
                {formatCurrency(SUBSCRIPTION_TYPE_PRICES[subscriptionType][0] * months)}
            </div>
            <div>
                <h2 className="font-medium leading-6 text-gray-900">Total with subscription costs</h2>
                {formatCurrency(totalWithSubscription)}
            </div>

            <div className="col-span-full">
                <h2 className="font-medium leading-6 text-gray-900">Comparison of subscriptions</h2>

                {[
                    SubscriptionType.WEEKEND_VRIJ,
                    SubscriptionType.WEEKEND_VRIJ_DALKORTING,
                    SubscriptionType.DAL_VRIJ,
                    SubscriptionType.ALTIJD_VRIJ
                ].includes(subscriptionType) && (
                    <p className="mb-2 italic">
                        The price of transactions with full discount can&apos;t be calculated, so some subscriptions
                        aren&apos;t shown in the comparison.
                    </p>
                )}

                <table className="min-w-full divide-y divide-gray-300">
                    <thead>
                        <tr>
                            <th scope="col" className="px-3 py-3.5 text-left font-semibold text-gray-900">
                                Subscription
                            </th>
                            <th scope="col" className="px-3 py-3.5 text-left font-semibold text-gray-900">
                                Subscription cost
                            </th>
                            <th scope="col" className="px-3 py-3.5 text-left font-semibold text-gray-900">
                                Travel costs
                            </th>
                            <th scope="col" className="px-3 py-3.5 text-left font-semibold text-gray-900">
                                Travel savings
                            </th>
                            <th scope="col" className="px-3 py-3.5 text-left font-semibold text-gray-900">
                                Total cost
                            </th>
                            <th scope="col" className="px-3 py-3.5 text-left font-semibold text-gray-900">
                                Total savings
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {Object.values(SubscriptionType).map((otherSubscriptionType) => (
                            <tr key={otherSubscriptionType}>
                                <td className="whitespace-nowrap px-3 py-2">
                                    {SUBSCRIPTION_TYPE_NAMES[otherSubscriptionType]}
                                </td>
                                <td className="whitespace-nowrap px-3 py-2">
                                    {formatCurrency(SUBSCRIPTION_TYPE_PRICES[otherSubscriptionType][0] * months)}
                                </td>
                                {SUBSCRIPTION_MISSING_DATA[subscriptionType].includes(otherSubscriptionType) ? (
                                    <>
                                        <td className="whitespace-nowrap px-3 py-2">-</td>
                                        <td className="whitespace-nowrap px-3 py-2">-</td>
                                        <td className="whitespace-nowrap px-3 py-2">-</td>
                                        <td className="whitespace-nowrap px-3 py-2">-</td>
                                    </>
                                ) : (
                                    <>
                                        <td className="whitespace-nowrap px-3 py-2">
                                            {formatCurrency(totalWithSubscriptionPrice[otherSubscriptionType])}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-2">
                                            {formatCurrency(total - totalWithSubscriptionPrice[otherSubscriptionType])}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-2">
                                            {formatCurrency(
                                                SUBSCRIPTION_TYPE_PRICES[otherSubscriptionType][0] * months +
                                                    totalWithSubscriptionPrice[otherSubscriptionType]
                                            )}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-2">
                                            {formatCurrency(
                                                totalWithSubscription -
                                                    (SUBSCRIPTION_TYPE_PRICES[otherSubscriptionType][0] * months +
                                                        totalWithSubscriptionPrice[otherSubscriptionType])
                                            )}
                                        </td>
                                    </>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
