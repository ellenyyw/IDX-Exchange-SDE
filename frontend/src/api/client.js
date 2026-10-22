export async function getProperty(params = {}) {
    const url = new URLSearchParams(params);
    const response = await fetch(`/api/properties?${url}`);

    if (!response.ok) {
        throw new Error(`Unable to connect to backend`);
    }
    
    return response.json();
}

export async function getPropertyId(id) {
    const response = await fetch(`/api/properties/${encodeURIComponent(id)}`);

    if (!response.ok) {
        throw new Error(`Unable to connect to backend`);
    }

    return response.json();
}