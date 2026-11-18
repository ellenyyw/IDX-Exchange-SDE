import Button from "@mui/material/Button";
const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

export default function PropertyMap({ lat, lng }) {
    if (!apiKey || lat == null || lng == null ||
        String(lat).trim() === "" || String(lng).trim() === "") {
        return null;
    }

    const coordinates = `${lat},${lng}`;
    const mapParams = new URLSearchParams({
        key: apiKey,
        center: coordinates,
        zoom: "15",
    });
    const directionsParams = new URLSearchParams({
        api: "1",
        destination: coordinates,
    });

    return (
        <div>
            <iframe
                title="Property location"
                src={`https://www.google.com/maps/embed/v1/view?${mapParams}`}
                width="100%"
                height="320"
                style={{ border: 0, display: "block" }}
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
            />
            <Button
                variant="contained"
                sx={{ mt: 1 }}
                href={`https://www.google.com/maps/dir/?${directionsParams}`}
                target="_blank"
                rel="noopener noreferrer"
            >
                Get Directions
            </Button>
        </div>
    );
}
