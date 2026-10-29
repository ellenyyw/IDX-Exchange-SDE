import { useState, useEffect } from 'react';
import { getProperty, getPropertyId } from "../api/client";
import PropertyCard from "./PropertyCard";
import PropertyFilters from "./PropertyFilters"
import Grid from "@mui/material/Grid";
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

export default function ListingsPage() {
    const [properties, setProperties] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const data = await getProperty();
            setProperties(data.results);
            setTotal(data.total);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }

    const handleSearch = async (filters) => {
        setLoading(true);
        setError(null);

        try {
            const data = await getProperty(filters);
            setProperties(data.results);
            setTotal(data.total);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="listing-page" style={{ marginLeft: 24, marginRight : 24, paddingBottom: 50 }}>
            <h1>Property Listings</h1>

            <PropertyFilters onSearch={handleSearch} />

            <p>Showing {properties.length} of {total} properties</p>

            {loading ? (
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        minHeight: 300,
                    }}
                >
                    <Typography sx={{ fontSize: 36, fontWeight: 'bold' }}>
                        Loading...
                    </Typography>
                </Box>
            ) : error ? (
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        minHeight: 300,
                    }}
                >
                    <Typography color="error" sx={{ fontSize: 36, fontWeight: 'bold' }}>
                        Error Message: {error}
                    </Typography>
                </Box>
            ) : properties.length === 0 ? (
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        minHeight: 300,
                        gap: 1
                    }}
                >
                    <Typography sx={{ fontSize: 36, fontWeight: 'bold' }}>
                        No matching results :(
                    </Typography>
                    <Typography>
                        Try adjusting the filters
                    </Typography>
                </Box>
            ) : (
                <Grid container spacing={2}>
                    {properties.map((property) => (
                        <Grid key={property.id} size={3}>
                            <PropertyCard property={property} />
                        </Grid>
                    ))}
                </Grid>
            )}
        </div>
    );
}
