import {TimeType, type Transaction} from './transaction';

export enum SubscriptionType {
    BASIS = 'BASIS',
    WEEKEND_VOORDEEL = 'WEEKEND_VOORDEEL',
    DAL_VOORDEEL = 'DAL_VOORDEEL',
    ALTIJD_VOORDEEL = 'ALTIJD_VOORDEEL',
    WEEKEND_VRIJ = 'WEEKEND_VRIJ',
    DAL_VRIJ = 'DAL_VRIJ',
    ALTIJD_VRIJ = 'ALTIJD_VRIJ'
}

export const SUBSCRIPTION_TYPE_NAMES: Record<SubscriptionType, string> = {
    [SubscriptionType.BASIS]: 'Basis',
    [SubscriptionType.WEEKEND_VOORDEEL]: 'Weekend Voordeel',
    [SubscriptionType.DAL_VOORDEEL]: 'Dal Voordeel',
    [SubscriptionType.ALTIJD_VOORDEEL]: 'Altijd Voordeel',
    [SubscriptionType.WEEKEND_VRIJ]: 'Weekend Vrij',
    [SubscriptionType.DAL_VRIJ]: 'Dal Vrij',
    [SubscriptionType.ALTIJD_VRIJ]: 'Altijd Vrij'
};

export const getDiscount = (transaction: Transaction, subscription: SubscriptionType) => {
    if (
        (subscription === SubscriptionType.WEEKEND_VOORDEEL && transaction.timeType === TimeType.WEEKEND) ||
        (subscription === SubscriptionType.DAL_VOORDEEL &&
            [TimeType.OFF_PEAK, TimeType.WEEKEND].includes(transaction.timeType)) ||
        subscription === SubscriptionType.ALTIJD_VOORDEEL
    ) {
        return 0.4;
    }

    if (
        (subscription === SubscriptionType.WEEKEND_VRIJ && transaction.timeType === TimeType.WEEKEND) ||
        (subscription === SubscriptionType.DAL_VRIJ && [TimeType.OFF_PEAK, TimeType.WEEKEND]) ||
        subscription === SubscriptionType.ALTIJD_VRIJ
    ) {
        return 1;
    }

    return 0;
};

export const getBasePrice = (transaction: Transaction, subscription: SubscriptionType) => {
    const discount = getDiscount(transaction, subscription);

    // The price from a full discount can't be recovered, so use it as is
    return Math.floor(transaction.total * (discount === 1 ? 1 : 1 / (1 - discount)));
};

export const getSubscriptionPrice = (transaction: Transaction, subscription: SubscriptionType) => {
    const discount = getDiscount(transaction, subscription);

    return Math.floor(transaction.total * (1 - discount));
};
