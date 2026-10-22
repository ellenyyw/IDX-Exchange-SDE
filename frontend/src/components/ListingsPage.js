import { useState, useEffect } from 'react';
import { getProperty, getPropertyId } from "../api/client";
import PropertyCard from "./PropertyCard";
import Grid from "@mui/material/Grid";

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

    if (loading) return <div>Loading...</div>

    if (error) return <div>Error Message: {error}</div>;

    return (
        <div className="listing-page" style={{ marginLeft: 24, marginRight : 24, paddingBottom: 50 }}>
            <h1>Property Listings</h1>

            <p>Showing {properties.length} of {total} properties</p>

            <Grid container spacing={2}>
                {properties.map(property => (
                    <Grid key={property.id} size={3}>
                        <PropertyCard property={property} />
                    </Grid>
                ))}
            </Grid>
        </div>
    );
}
