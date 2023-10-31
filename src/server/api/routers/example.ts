import {z} from 'zod';

import {t} from '~/server/api/trpc';

export const exampleRouter = t.router({
    hello: t.procedure.input(z.object({text: z.string()})).query(({input}) => {
        return {
            greeting: `Hello ${input.text}`
        };
    })
});
