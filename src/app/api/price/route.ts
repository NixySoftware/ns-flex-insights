import {ClassType} from '@prisma/client';
import {DateTime} from 'luxon';

import {getPrice} from '~/ns/api';
import {prisma} from '~/server/prisma';

export const GET = async (request: Request) => {
    const url = new URL(request.url);
    const origin = url.searchParams.get('origin');
    const destination = url.searchParams.get('destination');

    if (!origin || !destination) {
        return Response.json(
            {
                message: 'Missing origin and/or destination parameters.'
            },
            {
                status: 400
            }
        );
    }

    const originStation = await prisma.station.findFirst({
        where: {
            name: origin
        }
    });
    if (!originStation) {
        return Response.json(
            {
                message: 'Could not find origin station.'
            },
            {
                status: 400
            }
        );
    }

    const destinationStation = await prisma.station.findFirst({
        where: {
            name: destination
        }
    });
    if (!destinationStation) {
        return Response.json(
            {
                message: 'Could not find destination station.'
            },
            {
                status: 400
            }
        );
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
                    .toISO() as string
            }
        },
        select
    });

    if (!journey) {
        const data = await getPrice({
            fromStation: origin,
            toStation: destination
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
            return Response.json(
                {
                    message: 'Could not find price option for route.'
                },
                {status: 400}
            );
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

    return Response.json(journey);
};
