import {useTranslations} from 'next-intl';

import type {TimeType} from '~/ns';

export interface TimeTypeNameProps {
    timeType: TimeType;
}

export const TimeTypeName: React.FC<TimeTypeNameProps> = ({timeType}) => {
    const t = useTranslations('TimeTypeName');
    return t(timeType);
};
