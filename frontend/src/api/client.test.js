import { render, screen } from '@testing-library/react';
import { getProperty, getPropertyId } from "./client";

beforeEach(() => {
    global.fetch = jest.fn();
});

test("fetches all properties", async () => {
    const mockData = { total: 1, results: [{ id: 1 }] };

    global.fetch.mockResolvedValue({
        ok: true,
        json: async () => mockData,
    });

    const data = await getProperty();

    expect(data).toEqual(mockData);
    expect(global.fetch).toHaveBeenCalledWith("/api/properties?");
});

test("fetches properties with one filter", async () => {
    global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ total: 0, results: [] }),
    });

    await getProperty({ city: "Irvine" });

    expect(global.fetch).toHaveBeenCalledWith(
        "/api/properties?city=Irvine"
    );
});

test("fetches properties with multiple filters", async () => {
    global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ total: 0, results: [] }),
    });

    await getProperty({ city: "Irvine",  minPrice: 300000, beds: 3 });

    expect(global.fetch).toHaveBeenCalledWith(
        "/api/properties?city=Irvine&minPrice=300000&beds=3"
    );
});