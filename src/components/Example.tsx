'use client';

import {api} from '~/trpc/react';

export const Example: React.FC<Record<string, never>> = () => {
    const test = api.example.hello.useQuery({text: 'World'});

    return (
        <div className="mx-auto max-w-6xl px-4">
            {test.isLoading && <h1>Loading...</h1>}
            {test.data && <h1>{test.data.greeting}</h1>}
            {test.error && <h1>{test.error.message}</h1>}
        </div>
    );
};
