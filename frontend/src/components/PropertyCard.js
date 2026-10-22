import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import CardActionArea from '@mui/material/CardActionArea';
import { useState } from "react";

function getFirstPhoto(photos) {
  try {
    const jsonArray = JSON.parse(photos);

    if (!Array.isArray(jsonArray)) return null;

    return jsonArray[0] ?? null;
  } catch (error) {
    return null;
  }
}

export default function PropertyCard( {property} ) {
  const photo = getFirstPhoto(property.L_Photos);
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <Card sx={{ maxWidth: 345 }}>
      <CardActionArea>
        {photo && !imageFailed ? (
          <CardMedia
            component="img"
            height="140"
            image={photo}
            alt={"Property image unavailable"}
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div style={{
              height: 140,
              display: "grid",
              placeItems: "center",
              background: "grey",
              color: "white"
            }}
          > No image available</div>
        )}
        <CardContent>
          <Typography>
            {property.L_SystemPrice == null ? "Price unavailable"
            : Number(property.L_SystemPrice).toLocaleString("en-US", {
                style: "currency",
                currency: "USD",
                maximumFractionDigits: 0
              })}
          </Typography>
          <Typography>{property.L_Address}</Typography>
          <Typography>{property.L_City}, {property.L_State}</Typography>
          <Typography>
            {property.L_Keyword2 ?? "—"} beds {" "}
            {property.LM_Dec_3 ?? "—"} baths {" "}
            {property.LM_Int2_3 ?? "—"} sqft {" "}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
