import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import CardActionArea from '@mui/material/CardActionArea';
import { Link } from "react-router";
import PropertyImageCarousel from './PropertyImageCarousel';

export default function PropertyCard( {property} ) {
  const detailPagePath = `/property/${property.L_ListingID}`;

  return (
    <Card sx={{ maxWidth: 345 }}>
      <PropertyImageCarousel
        key={property.L_ListingID}
        photosJson={property.L_Photos}
        detailPagePath={detailPagePath}
      />
      <CardActionArea component={Link} to={detailPagePath}>
        <CardContent>
          <Typography sx={{ fontWeight: 'bold' }}>
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
