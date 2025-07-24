import type {Metadata} from 'next';
import {NextIntlClientProvider, hasLocale} from 'next-intl';
import {notFound} from 'next/navigation';
import type {PropsWithChildren} from 'react';

import '~/app/globals.css';
import {Footer} from '~/components/Footer';
import {Header} from '~/components/Header';
import {routing} from '~/i18n/routing';
import {TRPCReactProvider} from '~/trpc/react';

export const metadata: Metadata = {
    title: 'NS Flex Insights',
    description: 'Insight into NS Flex travel costs.'
};

export interface RootLayoutProps extends PropsWithChildren {
    params: Promise<{locale: string}>;
}

const RootLayout: React.FC<RootLayoutProps> = async ({children, params}) => {
    // Ensure that the incoming `locale` is valid
    const {locale} = await params;
    if (!hasLocale(routing.locales, locale)) {
        notFound();
    }

    return (
        <html lang={locale}>
            <body>
                <NextIntlClientProvider locale={locale}>
                    <TRPCReactProvider>
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
