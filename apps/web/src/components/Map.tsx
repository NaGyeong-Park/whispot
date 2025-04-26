import { CSSProperties, useCallback, useEffect, useState } from "react";
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";
import { GOOGLE_MAP_API_KEY } from "../constants/map";

const containerStyle: CSSProperties = {
  width: "100%",
  height: "500px",
};

type Location = { lat: number; lng: number };

interface Props {
  center: Location;
  markers: Location[];
  onClick: (value: Location) => void;
}

export function Map({ center, markers, onClick }: Props) {
  const [map, setMap] = useState(null);
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: GOOGLE_MAP_API_KEY,
  });

  useEffect(() => {
    if (map && center) {
      map.panTo(center);
    }
  }, [center, map]);

  if (!isLoaded) return <div>Loading</div>;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={14}
      onLoad={(mapInstance: google.maps.Map) => setMap(mapInstance)}
      onClick={event => {
        onClick({
          lat: event.latLng.lat(),
          lng: event.latLng.lng(),
        });
      }}
    >
      {markers.map((position, index) => (
        <Marker key={index} position={position} />
      ))}
    </GoogleMap>
  );
}
