import {t} from '~/server/api/trpc';

import {journeyRouter} from './journey';
import {stationRouter} from './station';

export const appRouter = t.router({
    journey: journeyRouter,
    station: stationRouter
});

export type AppRouter = typeof appRouter;
