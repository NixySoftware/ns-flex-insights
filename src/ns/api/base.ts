import Ajv, {type JTDDataType} from 'ajv/dist/jtd';

const ajv = new Ajv();

const API_URL = 'https://gateway.apiportal.ns.nl';

const apiCall = async <Parameters extends Record<string, string>>(
    endpointUrl: string,
    parameters?: Parameters,
    init?: RequestInit
) => {
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
        headers,
        next: {
            revalidate: 7 * 24 * 60 * 60
        }
    });

    const data = await response.json();

    if (response.status >= 400 && response.status <= 599) {
        // TODO: handle errors
    }

    return data;
};

export const generateApiCall = <Parameters extends Record<string, string>, Schema extends Record<string, unknown>>(
    endpointUrl: string,
    schema: Schema
) => {
    const validate = ajv.compile(schema);

    return async (parameters?: Parameters, init?: RequestInit): Promise<JTDDataType<Schema>> => {
        const data = await apiCall(endpointUrl, parameters, init);

        if (!validate(data)) {
            // TODO
            console.error(validate.errors);
        }

        return data;
    };
};
