import {useTranslations} from 'next-intl';

import type {TransactionType as TransactionTypeEnum} from '~/ns';

export interface TransactionTypeNameProps {
    transactionType: TransactionTypeEnum;
}

export const TransactionTypeName: React.FC<TransactionTypeNameProps> = ({transactionType}) => {
    const t = useTranslations('TransactionTypeName');
    return t(transactionType);
};
