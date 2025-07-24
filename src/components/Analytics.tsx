import {groupBy, mapValues, sumBy} from 'lodash';
import {DateTime} from 'luxon';
import {useTranslations} from 'next-intl';
import {useMemo, useState} from 'react';

import {TimeTypeName} from '~/components/TimeTypeName';
import {TransactionTypeName} from '~/components/TransactionTypeName';
import {
    SUBSCRIPTION_MISSING_DATA,
    SUBSCRIPTION_TYPE_NAMES,
    SUBSCRIPTION_TYPE_PRICES,
    SubscriptionType,
    TimeType,
    type Transaction,
    TransactionType,
    getBasePrice,
    getSubscriptionPrice
} from '~/ns';
import {formatCurrency} from '~/util';

export type AnalyticsProps = {
    transactions: Transaction[];
};

export const Analytics = ({transactions: allTransactions}: AnalyticsProps) => {
    const t = useTranslations('Analytics');

    const [subscriptionType, setSubscriptionType] = useState(SubscriptionType.BASIS);

    // TODO: Check if length is at least one.
    const periodStartDate = (allTransactions.at(0) as Transaction).start;
    const periodEndDate = (allTransactions.at(-1) as Transaction).start;

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
        <div className="mb-6 grid grid-cols-2 gap-x-4 gap-y-2">
            <div>
                <h2 className="leading-6 font-medium text-gray-900">{t('all.period')}</h2>
                {periodStartDate.toFormat('dd-MM-yyyy')} - {periodEndDate.toFormat('dd-MM-yyyy')}
            </div>
            <div>
                <h2 className="leading-6 font-medium text-gray-900">{t('all.months')}</h2>
                {Math.ceil(periodEndDate.diff(periodStartDate).as('months'))}
            </div>
            <div>
                <label htmlFor="start-date" className="block leading-6 font-medium text-gray-900">
                    {t('date.start')}
                </label>
                <div className="mt-2">
                    <input
                        id="start-date"
                        className="block w-full rounded-md border-0 px-2 py-1.5 text-gray-900 shadow-sm ring-1 ring-gray-300 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 focus:ring-inset sm:text-sm sm:leading-6"
                        name="startDate"
                        type="date"
                        min={periodStartDate.toISODate() ?? ''}
                        max={periodEndDate.toISODate() ?? ''}
                        value={startDate.toISODate() ?? ''}
                        onChange={(event) => {
                            setStartDate(DateTime.fromISO(event.target.value));
                        }}
                    />
                </div>
            </div>
            <div>
                <label htmlFor="end-date" className="block leading-6 font-medium text-gray-900">
                    {t('date.end')}
                </label>
                <div className="mt-2">
                    <input
                        id="end-date"
                        className="block w-full rounded-md border-0 px-2 py-1.5 text-gray-900 shadow-sm ring-1 ring-gray-300 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 focus:ring-inset sm:text-sm sm:leading-6"
                        name="endDate"
                        type="date"
                        min={startDate.toISODate() ?? ''}
                        max={periodEndDate.toISODate() ?? ''}
                        value={endDate.toISODate() ?? ''}
                        onChange={(event) => {
                            setEndDate(DateTime.fromISO(event.target.value));
                        }}
                    />
                </div>
            </div>
            <div>
                <h2 className="leading-6 font-medium text-gray-900">{t('selected.period')}</h2>
                {startDate.toFormat('dd-MM-yyyy')} - {endDate.toFormat('dd-MM-yyyy')}
            </div>
            <div>
                <h2 className="leading-6 font-medium text-gray-900">{t('selected.months')}</h2>
                {months}
            </div>
            <div>
                <h2 className="leading-6 font-medium text-gray-900">{t('selected.amount')}</h2>
                {transactions.length}
            </div>
            <div>
                <h2 className="leading-6 font-medium text-gray-900">{t('selected.total')}</h2>
                {formatCurrency(total)}
            </div>
            <div>
                <h2 className="leading-6 font-medium text-gray-900">{t('selected.amountByTransactionType')}</h2>
                <ul className="list-inside list-disc">
                    {Object.values(TransactionType).map((transactionType) => (
                        <li key={transactionType}>
                            <TransactionTypeName transactionType={transactionType} />:{' '}
                            {transactionsByTransactionType[transactionType]?.length ?? 0}
                        </li>
                    ))}
                </ul>
            </div>
            <div>
                <h2 className="leading-6 font-medium text-gray-900">{t('selected.totalByTransactionType')}</h2>
                <ul className="list-inside list-disc">
                    {Object.values(TransactionType).map((transactionType) => (
                        <li key={transactionType}>
                            <TransactionTypeName transactionType={transactionType} />:{' '}
                            {formatCurrency(totalByTransactionType[transactionType])}
                        </li>
                    ))}
                </ul>
            </div>
            <div>
                <h2 className="leading-6 font-medium text-gray-900">{t('selected.amountByTrainTimeType')}</h2>
                <ul className="list-inside list-disc">
                    {Object.values(TimeType)
                        .filter((timeType) => timeType !== TimeType.NONE)
                        .map((timeType) => (
                            <li key={timeType}>
                                <TimeTypeName timeType={timeType} />: {transactionsByTimeType[timeType]?.length ?? 0}
                            </li>
                        ))}
                </ul>
            </div>
            <div>
                <h2 className="leading-6 font-medium text-gray-900">{t('selected.totalByTrainTimeType')}</h2>
                <ul className="list-inside list-disc">
                    {Object.values(TimeType)
                        .filter((timeType) => timeType !== TimeType.NONE)
                        .map((timeType) => (
                            <li key={timeType}>
                                <TimeTypeName timeType={timeType} />: {formatCurrency(totalByTimeType[timeType])}
                            </li>
                        ))}
                </ul>
            </div>
            <div>
                <label htmlFor="subscription-type" className="block leading-6 font-medium text-gray-900">
                    {t('subscription.current')}
                </label>
                <select
                    id="subscription-type"
                    name="subscriptionType"
                    className="mt-2 block w-full rounded-md border-0 py-1.5 pr-10 pl-3 text-gray-900 ring-1 ring-gray-300 ring-inset focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    value={subscriptionType}
                    onChange={(event) => {
                        setSubscriptionType(event.target.value as SubscriptionType);
                    }}
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
                <h2 className="leading-6 font-medium text-gray-900">{t('subscription.monthlyCost')}</h2>
                {formatCurrency(SUBSCRIPTION_TYPE_PRICES[subscriptionType][0])}
            </div>
            <div />
            <div>
                <h2 className="leading-6 font-medium text-gray-900">{t('selected.totalSubscriptionCosts')}</h2>
                {formatCurrency(SUBSCRIPTION_TYPE_PRICES[subscriptionType][0] * months)}
            </div>
            <div>
                <h2 className="leading-6 font-medium text-gray-900">{t('selected.totalWithSubscriptionCosts')}</h2>
                {formatCurrency(totalWithSubscription)}
            </div>

            <div className="col-span-full">
                <h2 className="leading-6 font-medium text-gray-900">{t('comparison.title')}</h2>

                {[
                    SubscriptionType.WEEKEND_VRIJ,
                    SubscriptionType.WEEKEND_VRIJ_DALKORTING,
                    SubscriptionType.DAL_VRIJ,
                    SubscriptionType.ALTIJD_VRIJ
                ].includes(subscriptionType) && <p className="mb-2 italic">{t('comparison.warning')}</p>}

                <table className="min-w-full divide-y divide-gray-300">
                    <thead>
                        <tr>
                            <th scope="col" className="px-3 py-3.5 text-left font-semibold text-gray-900">
                                {t('comparison.subscription')}
                            </th>
                            <th scope="col" className="px-3 py-3.5 text-left font-semibold text-gray-900">
                                {t('comparison.subscriptionCosts')}
                            </th>
                            <th scope="col" className="px-3 py-3.5 text-left font-semibold text-gray-900">
                                {t('comparison.travelCosts')}
                            </th>
                            <th scope="col" className="px-3 py-3.5 text-left font-semibold text-gray-900">
                                {t('comparison.travelSavings')}
                            </th>
                            <th scope="col" className="px-3 py-3.5 text-left font-semibold text-gray-900">
                                {t('comparison.totalCosts')}
                            </th>
                            <th scope="col" className="px-3 py-3.5 text-left font-semibold text-gray-900">
                                {t('comparison.totalSavings')}
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {Object.values(SubscriptionType).map((otherSubscriptionType) => (
                            <tr key={otherSubscriptionType}>
                                <td className="px-3 py-2 whitespace-nowrap">
                                    {SUBSCRIPTION_TYPE_NAMES[otherSubscriptionType]}
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap">
                                    {formatCurrency(SUBSCRIPTION_TYPE_PRICES[otherSubscriptionType][0] * months)}
                                </td>
                                {SUBSCRIPTION_MISSING_DATA[subscriptionType].includes(otherSubscriptionType) ? (
                                    <>
                                        <td className="px-3 py-2 whitespace-nowrap">-</td>
                                        <td className="px-3 py-2 whitespace-nowrap">-</td>
                                        <td className="px-3 py-2 whitespace-nowrap">-</td>
                                        <td className="px-3 py-2 whitespace-nowrap">-</td>
                                    </>
                                ) : (
                                    <>
                                        <td className="px-3 py-2 whitespace-nowrap">
                                            {formatCurrency(totalWithSubscriptionPrice[otherSubscriptionType])}
                                        </td>
                                        <td className="px-3 py-2 whitespace-nowrap">
                                            {formatCurrency(total - totalWithSubscriptionPrice[otherSubscriptionType])}
                                        </td>
                                        <td className="px-3 py-2 whitespace-nowrap">
                                            {formatCurrency(
                                                SUBSCRIPTION_TYPE_PRICES[otherSubscriptionType][0] * months +
                                                    totalWithSubscriptionPrice[otherSubscriptionType]
                                            )}
                                        </td>
                                        <td className="px-3 py-2 whitespace-nowrap">
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
