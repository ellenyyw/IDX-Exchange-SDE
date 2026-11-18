import { useState, useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

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

export default function PropertyImageGallery({ photosJson }) {
    const [index, setIndex] = useState(0);
    const [open, setOpen] = useState(false);
    const [failedPhotos, setFailedPhotos] = useState([]);
    const stripRef = useRef(null);
    const photos = parsePhotos(photosJson);
    const activeIndex = index < photos.length ? index : 0;
    const photo = photos[activeIndex];

    const imageAvailable = photo && !failedPhotos.includes(photo);

    useEffect(() => {
        const strip = stripRef.current;
        const selected = strip?.querySelector('[aria-pressed="true"]');
        if (!selected) return;

        const stripBounds = strip.getBoundingClientRect();
        const thumbnailBounds = selected.getBoundingClientRect();

        if (thumbnailBounds.left < stripBounds.left) {
            strip.scrollBy({ left: thumbnailBounds.left - stripBounds.left, behavior: 'smooth' });
        } else if (thumbnailBounds.right > stripBounds.right) {
            strip.scrollBy({ left: thumbnailBounds.right - stripBounds.right, behavior: 'smooth' });
        }
    }, [activeIndex, photosJson]);

    function markFailed(url) {
        setFailedPhotos((urls) => urls.includes(url) ? urls : [...urls, url]);
    }

    function movePhoto(step) {
        setIndex((activeIndex + step + photos.length) % photos.length);
    }

    function handleLightboxKeyDown(event) {
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
            event.preventDefault();
            movePhoto(event.key === 'ArrowLeft' ? -1 : 1);
        }
    }

    return (
        <Box component="section" aria-label="Property photos" sx={{ my: 3 }}>
            {imageAvailable ? (
                <Box
                    component="button"
                    type="button"
                    onClick={() => setOpen(true)}
                    sx={{ display: 'block', width: '100%', p: 0, border: 0 }}
                >
                    <Box
                        component="img"
                        src={photo}
                        onError={() => markFailed(photo)}
                        sx={{ display: 'block', width: '100%', height: { xs: 240, sm: 420 }, objectFit: 'cover' }}
                    />
                </Box>
            ) : (
                <Box sx={{ height: { xs: 240, sm: 420 }, display: 'grid', placeItems: 'center', bgcolor: 'grey.200' }}>
                    No image available
                </Box>
            )}

            {photos.length > 1 && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Button
                        onClick={() => movePhoto(-1)}
                        sx={{ minWidth: 36 }}
                    >
                        ‹
                    </Button>

                    <Box
                        ref={stripRef}
                        sx={{ display: 'flex', flex: 1, minWidth: 0, gap: 1, overflowX: 'auto', py: 1 }}
                    >
                        {photos.map((url, photoIndex) => (
                            <Box
                                key={`${photoIndex}-${url}`}
                                component="button"
                                type="button"
                                aria-label={`Show photo ${photoIndex + 1}`}
                                aria-pressed={photoIndex === activeIndex}
                                onClick={() => setIndex(photoIndex)}
                                sx={{
                                    flex: '0 0 90px',
                                    height: 62,
                                    p: 0,
                                    overflow: 'hidden',
                                    border: '2px solid',
                                    borderColor: photoIndex === activeIndex ? 'primary.main' : 'transparent',
                                    bgcolor: 'grey.200',
                                    cursor: 'pointer',
                                }}
                            >
                                {failedPhotos.includes(url) ? photoIndex + 1 : (
                                    <Box
                                        component="img"
                                        src={url}
                                        alt=""
                                        loading="lazy"
                                        onError={() => markFailed(url)}
                                        sx={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                )}
                            </Box>
                        ))}
                    </Box>

                    <Button
                        onClick={() => movePhoto(1)}
                        sx={{ minWidth: 36 }}
                    >
                        ›
                    </Button>
                </Box>
            )}

            {photos.length > 0 && (
                <Dialog
                    fullScreen
                    open={open}
                    onClose={() => setOpen(false)}
                    onKeyDown={handleLightboxKeyDown}
                    aria-label="Full-screen property photos"
                >
                    <Box
                        onClick={(event) => {
                            if (event.target === event.currentTarget) setOpen(false);
                        }}
                        sx={{
                            flex: 1, display: 'grid', placeItems: 'center',
                            bgcolor: 'grey.900', color: 'white', position: 'relative', p: 3,
                        }}
                    >
                        <Button autoFocus color="inherit" onClick={() => setOpen(false)}
                            sx={{ position: 'absolute', top: 8, right: 8 }}>
                            Close
                        </Button>

                        {imageAvailable ? (
                            <Box
                                component="img"
                                src={photo}
                                onError={() => markFailed(photo)}
                                sx={{ display: 'block', maxWidth: '100%', maxHeight: '75vh', objectFit: 'contain' }}
                            />
                        ) : (
                            <Typography>No image available</Typography>
                        )}

                        {photos.length > 1 && (
                            <Box sx={{ position: 'relative', bottom: 8, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <IconButton color="inherit" onClick={() => movePhoto(-1)}>←</IconButton>
                                <Typography>{activeIndex + 1} / {photos.length}</Typography>
                                <IconButton color="inherit" onClick={() => movePhoto(1)}>→</IconButton>
                            </Box>
                        )}
                    </Box>
                </Dialog>
            )}
        </Box>
    );
}