import { render, screen, fireEvent } from '@testing-library/react';
import PropertyFilters from './PropertyFilters';

test("render filter inputs", () => {
    render(<PropertyFilters onSearch={jest.fn()} />);

    expect(screen.getByLabelText("City")).toBeTruthy();
    expect(screen.getByLabelText("Zipcode")).toBeTruthy();
    expect(screen.getByLabelText("Min Price")).toBeTruthy();
    expect(screen.getByLabelText("Max Price")).toBeTruthy();
    expect(screen.getByLabelText("Beds")).toBeTruthy();
    expect(screen.getByLabelText("Baths")).toBeTruthy();
});

test("select filters", () => {
    const mockSearch = jest.fn();

    render(<PropertyFilters onSearch={mockSearch} />);

    fireEvent.change(screen.getByLabelText("City"), {
        target: { value: "Irvine" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Search" }));

    expect(mockSearch).toHaveBeenCalledWith({ city: "Irvine" });
});

test("clear filters", () => {
    const mockSearch = jest.fn();

    render(<PropertyFilters onSearch={mockSearch} />);

    const cityInput = screen.getByLabelText("City");

    fireEvent.change(cityInput, {
        target: { value: "Irvine" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Clear" }));

    expect(cityInput.value).toBe("");
    expect(mockSearch).toHaveBeenCalledWith({});
});