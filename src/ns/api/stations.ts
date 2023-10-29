import {env} from '~/env.mjs';

import {generateApiCall} from './base';

const schema = {
    definitions: {
        station: {
            properties: {
                UICCode: {
                    type: 'string'
                },
                stationType: {
                    enum: [
                        'FACULTATIEF_STATION',
                        'INTERCITY_STATION',
                        'KNOOPPUNT_INTERCITY_STATION',
                        'KNOOPPUNT_SNELTREIN_STATION',
                        'KNOOPPUNT_STOPTREIN_STATION',
                        'MEGA_STATION',
                        'SNELTREIN_STATION',
                        'STOPTREIN_STATION'
                    ]
                },
                EVACode: {
                    type: 'string'
                },
                code: {
                    type: 'string'
                },
                sporen: {
                    elements: {
                        ref: 'spoor'
                    }
                },
                synoniemen: {
                    elements: {
                        type: 'string'
                    }
                },
                heeftFaciliteiten: {
                    type: 'boolean'
                },
                heeftVertrektijden: {
                    type: 'boolean'
                },
                heeftReisassistentie: {
                    type: 'boolean'
                },
                namen: {
                    properties: {
                        lang: {
                            type: 'string'
                        },
                        middel: {
                            type: 'string'
                        },
                        kort: {
                            type: 'string'
                        }
                    }
                },
                land: {
                    type: 'string'
                },
                lat: {
                    type: 'float64'
                },
                lng: {
                    type: 'float64'
                },
                radius: {
                    type: 'int32'
                },
                naderenRadius: {
                    type: 'int32'
                },
                ingangsDatum: {
                    type: 'string'
                },
                nearbyMeLocationId: {
                    properties: {
                        value: {
                            type: 'string'
                        },
                        type: {
                            enum: ['stationV2']
                        }
                    }
                }
            }
        },
        spoor: {
            properties: {
                spoorNummer: {
                    type: 'string'
                }
            }
        }
    },

    properties: {
        payload: {
            elements: {
                ref: 'station'
            }
        }
    }
} as const;

export type GetStationsParameters = {
    q: string;
    countryCodes: string;
    limit: number;
};

export type GetStationsData = ReturnType<typeof getStations>;

export const getStations = generateApiCall<GetStationsParameters, typeof schema>(
    '/reisinformatie-api/api/v2/stations',
    env.NS_TRAVEL_API_SUBSCRIPTION_KEY,
    schema
);
