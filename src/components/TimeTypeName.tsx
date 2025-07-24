import {useTranslations} from 'next-intl';

import type {TimeType} from '~/ns';

export type TimeTypeNameProps = {
    timeType: TimeType;
};

export const TimeTypeName = ({timeType}: TimeTypeNameProps) => {
    const t = useTranslations('TimeTypeName');
    return t(timeType);
};
