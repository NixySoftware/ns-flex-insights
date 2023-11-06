import {env} from '~/env.mjs';

import {generateApiCall} from './base';

const schema = {
    definitions: {
        priceOption: {
            discriminator: 'type',
            mapping: {
                FIXED_PRICE: {
                    properties: {
                        tariefEenheden: {
                            type: 'int32'
                        },
                        prices: {
                            elements: {
                                ref: 'price'
                            }
                        }
                    }
                },
                FREE_TRAVEL: {
                    properties: {
                        tariefEenheden: {
                            type: 'int32'
                        },
                        prices: {
                            elements: {
                                ref: 'price'
                            }
                        }
                    }
                },
                ROUTE_WITH_INDICATION: {
                    properties: {
                        tariefEenheden: {
                            type: 'int32'
                        },
                        routeIndication: {
                            type: 'string'
                        },
                        totalPrices: {
                            elements: {
                                ref: 'price'
                            }
                        },
                        trajecten: {
                            elements: {
                                ref: 'traject'
                            }
                        }
                    }
                }
            }
        },
        price: {
            properties: {
                classType: {
                    enum: ['NONE', 'FIRST', 'SECOND']
                },
                discountType: {
                    enum: ['NONE', 'TWENTY_PERCENT', 'FORTY_PERCENT']
                },
                productType: {
                    enum: [
                        'SINGLE_FARE',
                        'RETURN_FARE',
                        'TRAJECTVRIJ_NSBUSINESSKAART',
                        'TRAJECTVRIJ_MAAND',
                        'TRAJECTVRIJ_JAAR',
                        'RAILRUNNER',
                        'SUPPLEMENT_ICE_INTERNATIONAL',
                        'SUPPLEMENT_SINGLE_USE_OV_CHIPKAART'
                    ]
                },
                price: {
                    type: 'int32'
                },
                supplements: {
                    optionalProperties: {
                        kaart: {
                            type: 'int32'
                        }
                    }
                }
            }
        },
        traject: {
            properties: {
                transporter: {
                    type: 'string'
                },
                from: {
                    type: 'string'
                },
                to: {
                    type: 'string'
                },
                prices: {
                    elements: {
                        ref: 'price'
                    }
                }
            }
        }
    },

    properties: {
        priceOptions: {
            elements: {
                ref: 'priceOption'
            }
        }
    }
} as const;

export type GetPriceParameters = {
    fromStation: string;
    toStation: string;
};

export type GetPriceData = ReturnType<typeof getPrice>;

export const getPrice = generateApiCall<GetPriceParameters, typeof schema>(
    '/public-prijsinformatie/prices',
    env.NS_PRICES_API_SUBSCRIPTION_KEY,
    schema
);
