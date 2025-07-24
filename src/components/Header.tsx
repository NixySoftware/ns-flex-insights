import {useTranslations} from 'next-intl';

export const Header = () => {
    const t = useTranslations('Header');

    return (
        <div className="my-4 flex justify-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">{t('title')}</h1>
        </div>
    );
};
