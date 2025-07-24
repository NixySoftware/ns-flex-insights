import {useTranslations} from 'next-intl';

import type {TransactionType as TransactionTypeEnum} from '~/ns';

export type TransactionTypeNameProps = {
    transactionType: TransactionTypeEnum;
};

export const TransactionTypeName = ({transactionType}: TransactionTypeNameProps) => {
    const t = useTranslations('TransactionTypeName');
    return t(transactionType);
};
