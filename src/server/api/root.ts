import {createCallerFactory, createTRPCRouter} from '~/server/api/trpc';

import {journeyRouter} from './routers/journey';
import {stationRouter} from './routers/station';

export const appRouter = createTRPCRouter({
    journey: journeyRouter,
    station: stationRouter
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
