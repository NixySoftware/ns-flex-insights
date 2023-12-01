import {DateTime} from 'luxon';

import {getStations} from '~/ns/api';
import {t} from '~/server/api/trpc';
import {prisma} from '~/server/prisma';

export const stationRouter = t.router({
    list: t.procedure.query(async () => {
        const station = await prisma.station.findFirst({
            where: {
                updatedAt: {
                    gte: DateTime.now()
                        .minus({
                            weeks: 1
                        })
                        .toISO()
                }
            }
        });

        if (!station) {
            const data = await getStations();
            const updatedAt = DateTime.now().toISO();

            await prisma.$transaction([
                ...data.payload.map((station) =>
                    prisma.station.upsert({
                        where: {
                            identifier: station.code.toUpperCase()
                        },
                        create: {
                            identifier: station.code.toUpperCase(),
                            name: station.namen.lang,
                            data: station
                        },
                        update: {
                            updatedAt,
                            name: station.namen.lang,
                            data: station
                        }
                    })
                ),
                prisma.station.deleteMany({
                    where: {
                        updatedAt: {
                            lt: updatedAt
                        }
                    }
                })
            ]);
        }

        const stations = await prisma.station.findMany({
            select: {
                id: true,
                identifier: true,
                name: true
            }
        });

        return stations;
    })
});
