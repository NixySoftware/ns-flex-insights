import {TimeType, type Transaction} from './transaction';

export enum SubscriptionType {
    BASIS = 'BASIS',
    WEEKEND_VOORDEEL = 'WEEKEND_VOORDEEL',
    DAL_VOORDEEL = 'DAL_VOORDEEL',
    ALTIJD_VOORDEEL = 'ALTIJD_VOORDEEL',
    WEEKEND_VRIJ = 'WEEKEND_VRIJ',
    WEEKEND_VRIJ_DALKORTING = 'WEEKEND_VRIJ_DALKORTING',
    DAL_VRIJ = 'DAL_VRIJ',
    ALTIJD_VRIJ = 'ALTIJD_VRIJ'
}

export const SUBSCRIPTION_TYPE_NAMES: Record<SubscriptionType, string> = {
    [SubscriptionType.BASIS]: 'Basis',
    [SubscriptionType.WEEKEND_VOORDEEL]: 'Weekend Voordeel',
    [SubscriptionType.DAL_VOORDEEL]: 'Dal Voordeel',
    [SubscriptionType.ALTIJD_VOORDEEL]: 'Altijd Voordeel',
    [SubscriptionType.WEEKEND_VRIJ]: 'Weekend Vrij excl. dalkorting',
    [SubscriptionType.WEEKEND_VRIJ_DALKORTING]: 'Weekend Vrij incl. dalkorting',
    [SubscriptionType.DAL_VRIJ]: 'Dal Vrij',
    [SubscriptionType.ALTIJD_VRIJ]: 'Altijd Vrij'
};

export const getDiscount = (transaction: Transaction, subscription: SubscriptionType) => {
    if (
        ((subscription === SubscriptionType.WEEKEND_VRIJ ||
            subscription === SubscriptionType.WEEKEND_VRIJ_DALKORTING) &&
            [TimeType.WEEKEND, TimeType.HOLIDAY].includes(transaction.timeType)) ||
        (subscription === SubscriptionType.DAL_VRIJ &&
            [TimeType.OFF_PEAK, TimeType.WEEKEND, TimeType.HOLIDAY].includes(transaction.timeType)) ||
        (subscription === SubscriptionType.ALTIJD_VRIJ &&
            [TimeType.PEAK, TimeType.OFF_PEAK, TimeType.WEEKEND, TimeType.HOLIDAY].includes(transaction.timeType))
    ) {
        return 1;
    }

    if (
        (subscription === SubscriptionType.WEEKEND_VOORDEEL &&
            [TimeType.WEEKEND, TimeType.HOLIDAY].includes(transaction.timeType)) ||
        ((subscription === SubscriptionType.DAL_VOORDEEL ||
            subscription === SubscriptionType.WEEKEND_VRIJ_DALKORTING) &&
            [TimeType.OFF_PEAK, TimeType.WEEKEND, TimeType.HOLIDAY].includes(transaction.timeType)) ||
        (subscription === SubscriptionType.ALTIJD_VOORDEEL &&
            [TimeType.PEAK, TimeType.OFF_PEAK, TimeType.WEEKEND, TimeType.HOLIDAY].includes(transaction.timeType))
    ) {
        return 0.4;
    }

    console.log(subscription, transaction.timeType);
    return 0;
};

export const getBasePrice = (transaction: Transaction, subscription: SubscriptionType) => {
    const discount = getDiscount(transaction, subscription);

    // The price from a full discount can't be recovered, so use it as is
    return transaction.total * (discount === 1 ? 1 : 1 / (1 - discount));
};

export const getSubscriptionPrice = (transaction: Transaction, subscription: SubscriptionType) => {
    const discount = getDiscount(transaction, subscription);

    return transaction.total * (1 - discount);
};
