import {getPrice} from '~/ns/api';

export const GET = async () => {
    const origin = 'Amsterdam Zuid';
    const destination = 'Enschede';

    const data = await getPrice({
        fromStation: origin,
        toStation: destination
    });

    return Response.json(data);
};
