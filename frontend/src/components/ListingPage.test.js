import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import ListingsPage from "./ListingsPage";
import Pagination from "@mui/material/Pagination";
import { getProperty } from "../api/client";

jest.mock("../api/client", () => ({
    getProperty: jest.fn(),
}));

jest.mock("./PropertyCard", () => {
    return function MockPropertyCard({ property }) {
        return <div>Property {property.id}</div>;
    };
});

beforeEach(() => {
    jest.clearAllMocks();

    window.scrollTo = jest.fn();

    getProperty.mockImplementation(async ({ limit, offset }) => ({
        total: 50,
        results: Array.from(
            { length: Math.max(0, Math.min(limit, 50 - offset)) },
            (_, index) => ({ id: offset + index + 1 })
        ),
    }));
});

test("Clicking a new page calls page change handler", () => {
    const handlePageChange = jest.fn();

    render(
        <Pagination
            page={1}
            count={3}
            onChange={handlePageChange}
        />
    );

    fireEvent.click(
        screen.getByRole("button", {
            name: /go to page 2/i,
        })
    );

    expect(handlePageChange).toHaveBeenCalledTimes(1);
    expect(handlePageChange).toHaveBeenCalledWith(expect.anything(), 2);
});

test("Prev is disabled on page 1", () => {
    render(<Pagination page={1} count={3} />);

    expect(
        screen.getByRole("button", {
            name: /go to previous page/i,
        })
    ).toBeDisabled();

    expect(
        screen.getByRole("button", {
            name: /go to next page/i,
        })
    ).toBeEnabled();
});

test("Next is disabled on the last page", () => {
    render(<Pagination page={3} count={3} />);

    expect(
        screen.getByRole("button", {
            name: /go to next page/i,
        })
    ).toBeDisabled();

    expect(
        screen.getByRole("button", {
            name: /go to previous page/i,
        })
    ).toBeEnabled();
});

test("Using ellipsis for large number of pages", () => {
    render(<Pagination page={5} count={10} />);

    expect(screen.getAllByText("…")).toHaveLength(2);

    expect(
        screen.getByRole("button", { name: /^go to page 1$/i })
    ).toBeInTheDocument();

    expect(
        screen.getByRole("button", { name: /^go to page 10$/i })
    ).toBeInTheDocument();
});

test('Pagination with correct limit and offsets', async () => {
    render(<ListingsPage />);

    expect(await screen.findByText("Property 1")).toBeInTheDocument();

    expect(getProperty).toHaveBeenLastCalledWith({
        limit: 20,
        offset: 0,
    });

    fireEvent.click(
        screen.getByRole("button", { name: /go to page 2/i })
    );

    expect(await screen.findByText("Property 21")).toBeInTheDocument();

    expect(getProperty).toHaveBeenLastCalledWith({
        limit: 20,
        offset: 20,
    });

    expect(screen.queryByText("Property 1")).not.toBeInTheDocument();

    fireEvent.click(
        screen.getByRole("button", { name: /go to page 3/i })
    );

    expect(await screen.findByText("Property 41")).toBeInTheDocument();

    expect(getProperty).toHaveBeenLastCalledWith({
        limit: 20,
        offset: 40,
    });

    expect(await screen.findByText("Property 50")).toBeInTheDocument();

    expect(screen.queryByText("Property 51")).not.toBeInTheDocument();
})

test("Navigates to next page with active filters preserved and scrolls to top", async () => {
    render(<ListingsPage />);

    await screen.findByText("Property 1");

    fireEvent.change(screen.getByRole("textbox", { name: /city/i }), {
        target: { value: "Irvine" },
    });

    fireEvent.click(
        screen.getByRole("button", { name: /^search$/i })
    );

    await waitFor(() => {
        expect(getProperty).toHaveBeenLastCalledWith({
            city: "Irvine",
            limit: 20,
            offset: 0,
        });
    });

    const nextButton = await screen.findByRole("button", {
        name: /go to next page/i,
    });

    window.scrollTo.mockClear();
    fireEvent.click(nextButton);

    expect(await screen.findByText("Property 21")).toBeInTheDocument();

    expect(getProperty).toHaveBeenLastCalledWith({
        city: "Irvine",
        limit: 20,
        offset: 20,
    });

    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
});

test('Applying new filters resets to page 1', async () => {
    render(<ListingsPage />);

    fireEvent.click(
        await screen.findByRole("button", {
            name: /go to page 2/i,
        })
    );

    await screen.findByText("Property 21");

    fireEvent.change(screen.getByRole("textbox", { name: /city/i }), {
        target: { value: "Irvine" },
    });

    fireEvent.click(
        screen.getByRole("button", { name: /^search$/i })
    );

    expect(await screen.findByText("Property 1")).toBeInTheDocument();

    expect(getProperty).toHaveBeenLastCalledWith({
        city: "Irvine",
        limit: 20,
        offset: 0,
    });

    expect(
        screen.getByRole("button", { name: /^page 1$/i })
    ).toHaveAttribute("aria-current", "page");
})

test('Pagination is hidden when there is only one page', async () => {
    getProperty.mockResolvedValue({
        total: 10,
        results: [{ id: 1 }],
    });

    render(<ListingsPage />);

    expect(await screen.findByText("Property 1")).toBeInTheDocument();

    expect(
        screen.queryByRole("navigation", {
            name: /pagination navigation/i,
        })
    ).not.toBeInTheDocument();
})