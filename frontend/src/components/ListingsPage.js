import { useState, useEffect } from 'react';
import { getProperty } from "../api/client";
import PropertyCard from "./PropertyCard";
import PropertyFilters from "./PropertyFilters"
import Grid from "@mui/material/Grid";
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import ErrorBoundary from './ErrorBoundary';

const SORT_PARAMS = {
    default: {},
    "price asc": { sortBy: "L_SystemPrice", sortOrder: "ASC" },
    "price desc": { sortBy: "L_SystemPrice", sortOrder: "DESC" },
    date: { sortBy: "OnMarketDate", sortOrder: "DESC" },
    sqft: { sortBy: "LM_Int2_3", sortOrder: "DESC" },
    beds: { sortBy: "L_Keyword2", sortOrder: "DESC" },
};

const PHOTO_INTERVAL = 5000;

function getFirstPhoto({ L_Photos }) {
    try {
        const photos = typeof L_Photos === "string" ? JSON.parse(L_Photos) : L_Photos;
        const cover = Array.isArray(photos) ? photos[0] : null;
        return typeof cover === "string" ? cover.trim() : "";
    } catch {
        return "";
    }
}

export default function ListingsPage() {
    const [properties, setProperties] = useState([]);
    const [backgroundPhoto, setBackgroundPhoto] = useState("");
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(20);
    const [activeFilters, setActiveFilters] = useState({});
    const [sort, setSort] = useState("default");
    const totalPages = Math.ceil(total / itemsPerPage);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);

            try {
                const data = await getProperty({
                    ...activeFilters,
                    ...SORT_PARAMS[sort],
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

        fetchData();
    }, [currentPage, itemsPerPage, activeFilters, sort]);

    useEffect(() => {
        const photos = [...new Set(properties.map(getFirstPhoto).filter(Boolean))];
        const motionPreference = window.matchMedia?.("(prefers-reduced-motion: reduce)");
        let currentPhoto = "";
        let pendingImage;
        let timer;

        const showNextPhoto = () => {
            const candidates = photos.filter((photo) => photo !== currentPhoto);
            if (candidates.length === 0) return;

            const nextPhoto = candidates[Math.floor(Math.random() * candidates.length)];
            pendingImage = new Image();
            pendingImage.onload = () => {
                currentPhoto = nextPhoto;
                setBackgroundPhoto(nextPhoto);
                if (!motionPreference?.matches && photos.length > 1) {
                    timer = window.setTimeout(showNextPhoto, PHOTO_INTERVAL);
                }
            };
            pendingImage.onerror = () => {
                photos.splice(photos.indexOf(nextPhoto), 1);
                showNextPhoto();
            };
            pendingImage.src = nextPhoto;
        };

        setBackgroundPhoto("");
        showNextPhoto();

        return () => {
            window.clearTimeout(timer);
            if (pendingImage) {
                pendingImage.onload = null;
                pendingImage.onerror = null;
            }
        };
    }, [properties]);

    const handleSearch = async (filters) => {
        setActiveFilters({ ...filters });
        setSort("default");
        setCurrentPage(1);
    };

    const handleSortChange = (sortOrder) => {
        setSort(sortOrder);
        setCurrentPage(1);
    };

    const handlePageChange = async (event, page) => {
        setCurrentPage(page);
        window.scrollTo(0, 0);
    };

    return (
        <div className="listing-page" style={{ marginLeft: 24, marginRight : 24, paddingBottom: 50 }}>
            <Box
                component="section"
                aria-labelledby="listings-title"
                sx={{
                    position: "relative",
                    isolation: "isolate",
                    overflow: "hidden",
                    bgcolor: "#20342f",
                    borderRadius: 3,
                    px: { xs: 2, sm: 3, md: 4 },
                    pt: { xs: 4, md: 9 },
                    pb: { xs: 2, md: 4 },
                    mt: 3,
                    mb: 3,
                }}
            >
                {backgroundPhoto && (
                    <Box
                        component="img"
                        src={backgroundPhoto}
                        alt=""
                        sx={{
                            position: "absolute",
                            inset: 0,
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            zIndex: -2,
                        }}
                    />
                )}
                <Box
                    aria-hidden="true"
                    sx={{
                        position: "absolute",
                        inset: 0,
                        bgcolor: "rgba(12, 27, 24, 0.48)",
                        zIndex: -1,
                    }}
                />
                <Typography
                    id="listings-title"
                    component="h1"
                    sx={{ color: "#fff", fontSize: { xs: 30, md: 44 }, fontWeight: 700, mb: 3 }}
                >
                    Property Listings
                </Typography>
                <PropertyFilters
                    onSearch={handleSearch}
                    sort={sort}
                    onSortChange={handleSortChange}
                />
            </Box>

            <ErrorBoundary>
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
            </ErrorBoundary>

        </div>
    );
}