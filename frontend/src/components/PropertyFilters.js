import { useState } from "react";
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Button from "@mui/material/Button";

export default function PropertyFilters( { onSearch, sort, onSortChange } ) {
    const [filters, setFilters] = useState({
        city: "",
        zipcode: "", 
        minPrice: "", 
        maxPrice: "",
        beds: "",
        baths: ""
    });

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFilters((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        const activeFilters = Object.fromEntries(
            Object.entries(filters).filter(([key, value]) => value !== "")
        );

        onSearch(activeFilters);
    };

    const handleClear = () => {
        setFilters({
            city: "",
            zipcode: "",
            minPrice: "",
            maxPrice: "",
            beds: "",
            baths: "",
        });

        onSearch({});
    };

    return (
        <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
                bgcolor: "background.paper",
                borderRadius: 2,
                boxShadow: 3,
                p: { xs: 2, md: 2.5 },
                "& .MuiOutlinedInput-root": { borderRadius: 2 },
                "& .MuiButton-root": { borderRadius: 2, textTransform: "none", minHeight: 40 },
            }}
        >
            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: {
                        xs: "repeat(2, minmax(0, 1fr))",
                        sm: "repeat(3, minmax(0, 1fr))",
                        lg: "repeat(6, minmax(0, 1fr))",
                    },
                    gap: 1.5,
                }}
            >
                <TextField
                    name="city"
                    label="City"
                    type="text"
                    size="small"
                    value={filters.city}
                    onChange={handleChange}
                />

                <TextField
                    name="zipcode"
                    label="ZIP Code"
                    type="text"
                    size="small"
                    value={filters.zipcode}
                    onChange={handleChange}
                />

                <TextField
                    name="minPrice"
                    label="Min Price"
                    type="number"
                    size="small"
                    value={filters.minPrice}
                    onChange={handleChange}
                />

                <TextField
                    name="maxPrice"
                    label="Max Price"
                    type="number"
                    size="small"
                    value={filters.maxPrice}
                    onChange={handleChange}
                />

                <FormControl variant="outlined" size="small">
                    <InputLabel id="beds-label">Beds</InputLabel>
                    <Select
                        labelId="beds-label"
                        name="beds"
                        value={filters.beds}
                        label="Beds"
                        onChange={handleChange}
                    >
                        {[1, 2, 3, 4, 5].map((n) => (
                            <MenuItem key={n} value={n}>{n}</MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <FormControl variant="outlined" size="small">
                    <InputLabel id="baths-label">Baths</InputLabel>
                    <Select
                        labelId="baths-label"
                        name="baths"
                        value={filters.baths}
                        label="Baths"
                        onChange={handleChange}
                    >
                        {[1, 2, 3, 4, 5].map((n) => (
                            <MenuItem key={n} value={n}>{n}</MenuItem>
                        ))}
                    </Select>
                </FormControl>

            </Box>

            <Box
                sx={{
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    justifyContent: "space-between",
                    gap: 1.5,
                    mt: 2,
                    pt: 2,
                    borderTop: 1,
                    borderColor: "divider",
                }}
            >
                <FormControl size="small" sx={{ minWidth: { sm: 200 } }}>
                    <InputLabel id="property-sort-label">Sort by</InputLabel>
                    <Select
                        labelId="property-sort-label"
                        label="Sort by"
                        value={sort ?? "default"}
                        onChange={(event) => onSortChange(event.target.value)}
                    >
                        <MenuItem value="default">Default</MenuItem>
                        <MenuItem value="price asc">Price: Low to High</MenuItem>
                        <MenuItem value="price desc">Price: High to Low</MenuItem>
                        <MenuItem value="date">Date Listed</MenuItem>
                        <MenuItem value="sqft">Square Footage</MenuItem>
                    </Select>
                </FormControl>

                <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
                    <Button variant="outlined" onClick={handleClear}>Clear</Button>
                    <Button variant="contained" type="submit">Search</Button>
                </Box>
            </Box>
        </Box>
    );
}