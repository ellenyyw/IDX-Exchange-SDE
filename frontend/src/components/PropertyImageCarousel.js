import Carousel from 'react-bootstrap/Carousel';
import Box from '@mui/material/Box';
import CardActionArea from '@mui/material/CardActionArea';
import CardMedia from '@mui/material/CardMedia';
import { useState } from 'react';
import { Link } from "react-router";
import "bootstrap/dist/css/bootstrap.min.css";


function parsePhotos(photosJson) {
    try {
        const photos = JSON.parse(photosJson);

        return Array.isArray(photos)
            ? photos.filter((url) => typeof url === "string" && url.trim())
            : [];
    } catch (error) {
        return [];
    }
}

export default function PropertyImageCarousel({ photosJson, detailPagePath }) {
    const [index, setIndex] = useState(0);
    const photos = parsePhotos(photosJson);
    const [failedPhotos, setFailedPhotos] = useState([]);
    const activeIndex = index < photos.length ? index : 0;

    const placeholder = (
        <Box sx={{ height: 140, display: "grid", placeItems: "center", bgcolor: "grey", color: "white" }}>
            Image not available
        </Box>
    );

    if (photos.length === 0) {
        return (
            <CardActionArea component={Link} to={detailPagePath}>
                {placeholder}
            </CardActionArea>
        );
    }

    return (
        <Box sx={{ position: 'relative' }}>
            <Carousel
                activeIndex={activeIndex}
                onSelect={setIndex}
                indicators={false}
                interval={null}
                controls={photos.length > 1}
            >
                {photos.map((photo, photoIndex) => (
                    <Carousel.Item key={`${photoIndex}-${photo}`}>
                        <CardActionArea component={Link} to={detailPagePath}>
                            {failedPhotos.includes(photo) ? placeholder : (
                                <CardMedia
                                    component="img"
                                    height="140"
                                    image={photo}
                                    alt={`Property photo ${photoIndex + 1}`}
                                    onError={() => setFailedPhotos((prev) => [...prev, photo])}
                                />
                            )}
                        </CardActionArea>
                    </Carousel.Item>
                ))}
            </Carousel>

            <Box sx={{
                position: 'absolute',
                bottom: 8,
                left: '50%',
                transform: 'translateX(-50%)',
                px: 1,
                borderRadius: 1,
                bgcolor: 'rgba(0, 0, 0, 0.65)',
                color: 'white',
                pointerEvents: 'none',
                zIndex: 1,
            }}>
                {activeIndex + 1} / {photos.length}
            </Box>
        </Box>
    );
}