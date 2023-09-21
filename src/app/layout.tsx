import type {Metadata} from 'next';
import type {PropsWithChildren} from 'react';

import './globals.css';

export const metadata: Metadata = {
    title: 'NS Flex Insights',
    description: 'Insight into NS Flex travel costs.'
};

const RootLayout: React.FC<PropsWithChildren<never>> = ({children}) => {
    return (
        <html lang="en">
            <body>
                <header>
                    <div className="my-4 flex justify-center">
                        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                            NS Flex Insights
                        </h1>
                    </div>
                </header>
                <main>
                    <div className="mx-auto max-w-6xl px-4">{children}</div>
                </main>
            </body>
        </html>
    );
};

export default RootLayout;
