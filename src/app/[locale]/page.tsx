'use client';

import {useTranslations} from 'next-intl';
import {useMemo, useState} from 'react';

import {Analytics} from '~/components/Analytics';
import {type CsvFile, TravelHistory} from '~/components/TravelHistory';
import {parseTransactions} from '~/ns';

const Home = () => {
    const t = useTranslations('Home');

    const [files, setFiles] = useState<CsvFile[]>([]);

    // TODO: find unique files/rows before parsing
    const transactions = useMemo(() => parseTransactions(files.flatMap((file) => file.rows)), [files]);

    // TODO: add tabs (overview, transactions, train, etc.)

    return (
        <>
            <TravelHistory files={files} setFiles={setFiles} />

            <div className="mt-6"></div>
            {files.length === 0 && (
                <div>
                    <h2 className="leading-6 font-medium text-gray-900">{t('howTo.title')}</h2>
                    {t('howTo.description')}
                </div>
            )}
            {files.length > 0 && transactions.length === 0 && <div>{t('none')}</div>}
            {transactions.length > 0 && (
                <div>
                    <Analytics transactions={transactions} />
                </div>
            )}
        </>
    );
};

export default Home;
