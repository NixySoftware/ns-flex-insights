import {initTRPC} from '@trpc/server';
import {type NextRequest} from 'next/server';
import superjson from 'superjson';
import {ZodError} from 'zod';

import {prisma} from '~/server/prisma';

interface CreateContextOptions {
    headers: Headers;
}

export const createInnerTRPCContext = (opts: CreateContextOptions) => {
    return {
        headers: opts.headers,
        prisma
    };
};

export const createTRPCContext = (opts: {req: NextRequest}) => {
    return createInnerTRPCContext({
        headers: opts.req.headers
    });
};

export const t = initTRPC.context<typeof createTRPCContext>().create({
    transformer: superjson,
    errorFormatter({shape, error}) {
        return {
            ...shape,
            data: {
                ...shape.data,
                zodError: error.cause instanceof ZodError ? error.cause.flatten() : null
            }
        };
    }
});
