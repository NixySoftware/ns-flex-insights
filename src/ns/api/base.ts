import Ajv, {type JTDDataType} from 'ajv/dist/jtd';

export const API_URL = 'https://gateway.apiportal.ns.nl';

const ajv = new Ajv();

export const generateApiCall = <Parameters extends Record<string, string>, Schema extends Record<string, unknown>>(
    endpointUrl: string,
    schema: Schema
) => {
    const validate = ajv.compile(schema);

    return async (parameters?: Parameters, init?: RequestInit): Promise<JTDDataType<Schema>> => {
        const headers = new Headers(init?.headers);
        headers.set('Ocp-Apim-Subscription-Key', process.env.NS_API_SUBSCRIPTION_KEY ?? '');

        const url = new URL(`${API_URL}${endpointUrl}`);
        if (parameters) {
            for (const [key, value] of Object.entries(parameters)) {
                url.searchParams.set(key, value);
            }
        }

        const response = await fetch(url, {
            ...init,
            headers
        });

        const data = await response.json();

        if (response.status >= 400 && response.status <= 599) {
            // TODO: handle errors
        }

        if (!validate(data)) {
            // TODO
            console.error(validate.errors);
        }

        return data;
    };
};
