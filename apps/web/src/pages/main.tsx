import { useState } from "react";
import { Map } from "../components/Map";

export function MainPage() {
  // TODO: 앱에서 현재 위치 정보, 저장 된 위치들 받아오기
  const [currentLocation] = useState({ lat: 37.5665, lng: 126.978 });
  const [locations, setLocations] = useState([
    { lat: 37.567, lng: 126.9784 },
    { lat: 37.565, lng: 126.976 },
  ]);

  const handleMapClick = (location: { lat: number; lng: number }) => {
    setLocations(prev => [...prev, location]);
  };

  return (
    <main>
      <h1>📍 Whipspot</h1>
      <Map center={currentLocation} markers={locations} onClick={handleMapClick} />
    </main>
  );
}

export default MainPage;
