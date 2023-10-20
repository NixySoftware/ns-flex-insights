import {getPrice} from '~/ns/api';

export const GET = async () => {
    const data = await getPrice({
        fromStation: 'Amsterdam Zuid',
        toStation: 'Enschede'
    });

    return Response.json(data);
};
