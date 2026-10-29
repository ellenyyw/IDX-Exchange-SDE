import { useState } from "react";
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Button from "@mui/material/Button";

export default function PropertyFilters( {onSearch} ) {
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
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: 2,
                flexWrap: "nowrap",
                overflowX: "auto",
                width: 1,
                pt: 2,
                mb: 5,
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
                label="Zipcode"
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

            <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
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

            <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
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

            <Button variant="contained" color="primary" type="submit">Search</Button>

            <Button variant="outlined" color="inherit" onClick={handleClear}>Clear</Button>
        </Box>
    );
}