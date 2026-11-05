import { useState, useEffect } from 'react';
import { getProperty, getPropertyId } from "../api/client";
import PropertyCard from "./PropertyCard";
import PropertyFilters from "./PropertyFilters"
import Grid from "@mui/material/Grid";
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';

export default function ListingsPage() {
    const [properties, setProperties] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(20);
    const [activeFilters, setActiveFilters] = useState({});
    const totalPages = Math.ceil(total / itemsPerPage);

    useEffect(() => {
        fetchData();
    }, [currentPage, itemsPerPage, activeFilters]);

    const fetchData = async () => {
        setLoading(true);
        setError(null);

        try {
            const data = await getProperty({
                ...activeFilters,
                limit: itemsPerPage,
                offset: (currentPage - 1) * itemsPerPage,
            });
            setProperties(data.results);
            setTotal(data.total);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }

    const handleSearch = async (filters) => {
        setActiveFilters({ ...filters });
        setCurrentPage(1);
    };

    const handlePageChange = async (event, page) => {
        setCurrentPage(page);
        window.scrollTo(0, 0);
    };

    return (
        <div className="listing-page" style={{ marginLeft: 24, marginRight : 24, paddingBottom: 50 }}>
            <h1>Property Listings</h1>

            <PropertyFilters onSearch={handleSearch} />

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
                <>
                    <Typography sx={{ fontSize: 18, mb: 2, color: '#4C4C4C' }}>
                        Showing <strong> 
                            {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, total)}
                        </strong> of <strong>
                            {total}
                        </strong> properties
                    </Typography>

                    <Grid container spacing={2}>
                        {properties.map((property) => (
                            <Grid key={property.id} size={3}>
                                <PropertyCard property={property} />
                            </Grid>
                        ))}
                    </Grid>
                </>
            )}

            {!loading && !error && totalPages > 1 && (
                <Stack sx={{ mt: 5, alignItems: "center" }}>
                    <Pagination 
                        count={totalPages}
                        page={currentPage}
                        onChange={handlePageChange}
                        variant="outlined" shape="rounded" size="large" color="primary"
                        sx={{"& .MuiPaginationItem-page.Mui-selected": { fontWeight: 900 }}}
                    />
                </Stack>
            )}

        </div>
    );
}
