import type {Metadata} from 'next';
import {NextIntlClientProvider} from 'next-intl';
import {headers} from 'next/headers';
import {notFound} from 'next/navigation';
import type {PropsWithChildren} from 'react';

import '~/app/globals.css';
import {Footer} from '~/components/Footer';
import {Header} from '~/components/Header';
import getIntlConfig from '~/i18n';
import {TRPCReactProvider} from '~/trpc/react';

export const metadata: Metadata = {
    title: 'NS Flex Insights',
    description: 'Insight into NS Flex travel costs.'
};

const locales = ['en', 'nl'];

export interface RootLayoutProps extends PropsWithChildren {
    params: {
        locale: string;
    };
}

const RootLayout: React.FC<RootLayoutProps> = async ({children, params: {locale}}) => {
    if (!locales.includes(locale)) {
        notFound();
    }

    const intlConfig = await getIntlConfig({locale});

    return (
        <html lang={locale}>
            <body>
                <NextIntlClientProvider locale={locale} messages={intlConfig.messages} timeZone={intlConfig.timeZone}>
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
                </NextIntlClientProvider>
            </body>
        </html>
    );
};

export default RootLayout;
