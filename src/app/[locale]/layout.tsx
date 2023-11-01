import type {Metadata} from 'next';
import {headers} from 'next/headers';
import {notFound} from 'next/navigation';
import type {PropsWithChildren} from 'react';

import '~/app/globals.css';
import {Footer} from '~/components/Footer';
import {Header} from '~/components/Header';
import {TRPCReactProvider} from '~/trpc/react';

export const metadata: Metadata = {
    title: 'NS Flex Insights',
    description: 'Insight into NS Flex travel costs.'
};

const locales = ['en', 'nl'];

const RootLayout: React.FC<PropsWithChildren<Record<string, never>>> = ({children, params: {locale}}) => {
    const isValidLocale = locales.some((cur) => cur === locale);
    if (!isValidLocale) {
        notFound();
    }

    return (
        <html lang={locale}>
            <body>
                <TRPCReactProvider headers={headers()}>
                    <header>
                        <Header />
                    </header>
                    <main>
                        <div className="mx-auto max-w-6xl px-4">{children}</div>
                    </main>
                    <footer>
                        <Footer />
                    </footer>
                </TRPCReactProvider>
            </body>
        </html>
    );
};

export default RootLayout;
