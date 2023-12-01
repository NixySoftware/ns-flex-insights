import {ClassType} from '@prisma/client';
import {TRPCError} from '@trpc/server';
import {DateTime} from 'luxon';
import {z} from 'zod';

import {getPrice} from '~/ns/api';
import {t} from '~/server/api/trpc';
import {prisma} from '~/server/prisma';

const getJourneyInput = z.object({
    origin: z.string(),
    destination: z.string()
});

const getJourney = async (input: z.infer<typeof getJourneyInput>) => {
    const originStation = await prisma.station.findFirst({
        where: {
            name: input.origin
        }
    });
    if (!originStation) {
        throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Could not find origin station.'
        });
    }

    const destinationStation = await prisma.station.findFirst({
        where: {
            name: input.destination
        }
    });
    if (!destinationStation) {
        throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Could not find destination station.'
        });
    }

    const select = {
        id: true,

        originStation: {
            select: {
                id: true,
                identifier: true,
                name: true
            }
        },
        destinationStation: {
            select: {
                id: true,
                identifier: true,
                name: true
            }
        },
        prices: {
            select: {
                id: true,
                classType: true,
                price: true
            }
        }
    };

    let journey = await prisma.journey.findFirst({
        where: {
            originStation: {
                id: originStation.id
            },
            destinationStation: {
                id: destinationStation.id
            },
            updatedAt: {
                gte: DateTime.now()
                    .minus({
                        weeks: 1
                    })
                    .toISO()
            }
        },
        select
    });

    if (!journey) {
        const data = await getPrice({
            fromStation: input.origin,
            toStation: input.destination
        });

        let firstClassPrice: number | undefined;
        let secondClassPrice: number | undefined;
        for (const priceOption of data.priceOptions) {
            if (priceOption.type !== 'ROUTE_WITH_INDICATION') {
                continue;
            }
            if (new Set(priceOption.trajecten.map(({transporter}) => transporter)).size !== 1) {
                continue;
            }

            const prices = priceOption.totalPrices.filter(
                (price) => price.productType === 'SINGLE_FARE' && price.discountType === 'NONE'
            );
            firstClassPrice = prices.find((price) => price.classType === 'FIRST')?.price;
            secondClassPrice = prices.find((price) => price.classType === 'SECOND')?.price;
        }

        if (firstClassPrice === undefined && secondClassPrice === undefined) {
            throw new TRPCError({
                code: 'NOT_FOUND',
                message: 'Could not find any price options for route.'
            });
        }

        journey = await prisma.journey.create({
            data: {
                data,

                originStation: {
                    connect: {
                        id: originStation.id
                    }
                },
                destinationStation: {
                    connect: {
                        id: destinationStation.id
                    }
                },
                prices: {
                    createMany: {
                        data: [
                            ...(firstClassPrice ? [{classType: ClassType.FIRST, price: firstClassPrice}] : []),
                            ...(secondClassPrice ? [{classType: ClassType.SECOND, price: secondClassPrice}] : [])
                        ]
                    }
                }
            },
            select
        });
    }

    return journey;
};

export const journeyRouter = t.router({
    get: t.procedure.input(getJourneyInput).query(async ({input}) => {
        return await getJourney(input);
    }),
    getMany: t.procedure.input(z.array(getJourneyInput)).query(async ({input}) => {
        const journeys: Awaited<ReturnType<typeof getJourney>>[] = [];
        for (const journeyInput of input) {
            journeys.push(await getJourney(journeyInput));
        }
        return journeys;
    })
});
