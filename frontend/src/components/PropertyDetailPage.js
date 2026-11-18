import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { useState, useEffect } from 'react';
import { Link, useParams } from "react-router";
import { getPropertyId, getOpenHouses } from "../api/client";
import PropertyImageGallery from './PropertyImageGallery';
import PropertyMap from './PropertyMap';

function formatTime(time) {
    const match = /^(\d{1,2}):(\d{2})(?::\d{2})?$/.exec(time ?? "");
    if (!match) return time || "—";

    const hours = Number(match[1]);
    return `${hours % 12 || 12}:${match[2]} ${hours < 12 ? "AM" : "PM"}`;
}

function getRemarks(allData) {
    try {
        const data = typeof allData === "string" ? JSON.parse(allData) : allData;
        return data?.OpenHouseRemarks ?? "";
    } catch {
        return "";
    }
}

export default function PropertyDetailPage() {
    const { id } = useParams();
    const [property, setProperty] = useState(null);
    const [error, setError] = useState(null);
    const [openHouses, setOpenHouses] = useState(null);

    useEffect(() => {
        let ignore = false;

        async function fetchData() {
            setProperty(null);
            setError(null);
            setOpenHouses(null);

            if (!/^\d{9,10}$/.test(id ?? "")) {
                setError("Invalid property ID");
                return;
            }

            try {
                const data = await getPropertyId(id);
                if (ignore) return;

                if (!data?.[0]) {
                    setError("Property not found");
                    return;
                }

                setProperty(data[0]);
            } catch (error) {
                if (!ignore) setError(error.message);
                return;
            }

            try {
                const events = await getOpenHouses(id);
                if (!ignore) setOpenHouses(events);
            } catch {
                if (!ignore) setOpenHouses("Unable to load open houses");
            }
        }

        fetchData();

        return () => {
            ignore = true;
        };
    }, [id]);

    return (
        <div className="property-detail-page" style={{ marginLeft: 24, marginRight : 24, paddingBottom: 50 }}>

            {error ? (
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
            ) : !property ? (
                <Typography>Loading...</Typography>
            ) : (
                <>
                    <Box sx={{ mx: 5 }}>
                        <Button variant="outlined" color="primary" sx={{ mt: 3 }}>
                            <Link to="/">Back to listings</Link>
                        </Button>

                        <PropertyImageGallery
                            key={id}
                            photosJson={property.L_Photos}
                        />

                        <h1>Property Details</h1>

                        <Typography sx={{ fontWeight: 'bold', mt: 2 }}>
                            Price: {property.L_SystemPrice == null ? "Price unavailable"
                            : Number(property.L_SystemPrice).toLocaleString("en-US", {
                                style: "currency",
                                currency: "USD",
                                maximumFractionDigits: 0
                            })}
                        </Typography>
                        <Typography>
                            Address: {property.L_Address}, {property.L_City}, {property.L_State}, {property.L_Zip}
                        </Typography>
                        <Typography>
                            Beds: {property.L_Keyword2 ?? "—"} {" "}
                            Baths: {property.LM_Dec_3 ?? "—"}
                        </Typography>
                        <Typography>
                            Sqft: {property.LM_Int2_3 ?? "—"} {"   "}
                            Year Built: {property.YearBuilt ?? "-"}
                        </Typography>
                        <Typography>Description: {property.L_Remarks ?? "-"}</Typography>

                        {property.LMD_MP_Latitude != null && property.LMD_MP_Longitude != null && (
                            <>
                                <Typography variant="h6" sx={{ mt: 3, mb: 1, fontWeight: "bold" }}>
                                    Property Location
                                </Typography>

                                <Box>
                                    <PropertyMap
                                        lat={property.LMD_MP_Latitude}
                                        lng={property.LMD_MP_Longitude}
                                    />
                                </Box>
                            </>
                        )}

                        <Typography variant="h6" sx={{ mt: 3, mb: 1, fontWeight: 'bold' }}>
                            Open Houses
                        </Typography>
                        {openHouses === null ? (
                            <Typography>Loading open houses...</Typography>
                        ) : typeof openHouses === "string" ? (
                            <Typography color="error">{openHouses}</Typography>
                        ) : openHouses.length === 0 ? (
                            <Typography>No open houses scheduled</Typography>
                        ) : (
                            <Box>
                                {openHouses.map((event) => {
                                    const remarks = getRemarks(event.all_data);

                                    return (
                                        <Box
                                            key={event.id}
                                            sx={{
                                                p: 2,
                                                border: "2px solid",
                                                borderColor: "divider",
                                                borderRadius: 3,
                                                fontWeight: 'bold',
                                                width: "fit-content",
                                            }}
                                        >
                                            {event.OpenHouseDate?.slice(0, 10)}{": "}
                                            {formatTime(event.OH_StartTime)} {" - "} {formatTime(event.OH_EndTime)}

                                            {remarks && (
                                                <Typography sx={{ mt: 1 }}>
                                                    {remarks}
                                                </Typography>
                                            )}
                                        </Box>
                                    );
                                })}
                            </Box>
                        )}
                    </Box>
                </>
            )}
        </div>
    );
}