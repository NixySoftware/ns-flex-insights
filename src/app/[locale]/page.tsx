import {useMemo, useState} from 'react';

import {Analytics} from '~/components/Analytics';
import {type CsvFile, TravelHistory} from '~/components/TravelHistory';
import {parseTransactions} from '~/ns';

const Home: React.FC<Record<string, never>> = () => {
    const [files, setFiles] = useState<CsvFile[]>([]);

    // TODO: find unique files/rows before parsing
    const transactions = useMemo(() => parseTransactions(files.flatMap((file) => file.rows)), [files]);

    // TODO: add tabs (overview, transactions, train, etc.)

    return (
        <div className="space-y-12">
            <TravelHistory files={files} setFiles={setFiles} />

            {files.length === 0 && (
                <div className="col-span-full">
                    <h2 className="font-medium leading-6 text-gray-900">How to use</h2>
                    Upload one or more travel history files to get an insight into your NS Flex costs.
                </div>
            )}
            {files.length > 0 && transactions.length === 0 && (
                <div className="col-span-full">No transactions in uploaded files.</div>
            )}
            {transactions.length > 0 && (
                <div className="col-span-full">
                    <Analytics transactions={transactions} />
                </div>
            )}
        </div>
    );
};

export default Home;
