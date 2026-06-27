/// <reference types="@types/google.maps" />
import React, { useState } from "react";
import { APIProvider, Map, AdvancedMarker } from "@vis.gl/react-google-maps";
import usePlacesAutocomplete, { getGeocode, getLatLng } from "use-places-autocomplete";

// Center the initial map view on Accra, Ghana
const ACCRA_CENTER = { lat: 5.6037, lng: -0.1870 };

interface PickupLocationPickerProps {
  onLocationSelected: (location: { address: string; lat: number; lng: number }) => void;
}

export const PickupLocationPicker: React.FC<PickupLocationPickerProps> = ({ onLocationSelected }) => {
  const [markerPosition, setMarkerPosition] = useState(ACCRA_CENTER);
  const [mapCenter, setMapCenter] = useState(ACCRA_CENTER);
  const [zoom, setZoom] = useState(12);

  const {
    ready,
    value,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: {
      // Prioritize local coordinates in and around Accra
      locationBias: { radius: 30000, center: ACCRA_CENTER },
    },
    debounce: 300,
  });

  // Handle typing/selecting an address from the drop-down
  const handleSelectAddress = async (description: string) => {
    setValue(description, false);
    clearSuggestions();

    try {
      const results = await getGeocode({ address: description });
      const { lat, lng } = await getLatLng(results[0]);
      
      const newCoords = { lat, lng };
      setMarkerPosition(newCoords);
      setMapCenter(newCoords);
      setZoom(16); // Focus directly on the selected location
      onLocationSelected({ address: description, lat, lng });
    } catch (error) {
      console.error("Geocoding error:", error);
    }
  };

  // Handle dragging the pin on the live Google Map
  const handleMarkerDragEnd = async (e: google.maps.MapMouseEvent) => {
    if (!e.latLng) return;
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    
    setMarkerPosition({ lat, lng });

    try {
      const results = await getGeocode({ location: { lat, lng } });
      if (results[0]) {
        const formattedAddress = results[0].formatted_address;
        setValue(formattedAddress, false);
        onLocationSelected({ address: formattedAddress, lat, lng });
      }
    } catch (error) {
      console.error("Reverse geocoding error:", error);
    }
  };

  return (
    // Replace with your Google Maps API Key from the Google Cloud Console
    <APIProvider apiKey="YOUR_GOOGLE_MAPS_API_KEY">
      <div className="space-y-3 w-full">
        
        <div className="relative">
          <label className="block text-sm font-semibold text-muted-foreground mb-1.5">
            Pickup Address / GPS Location
          </label>
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            disabled={!ready}
            placeholder="Search for an address or drag the map pin below..."
            className="w-full px-3 py-2 text-sm border rounded-md bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-sm"
          />
          
          {status === "OK" && (
            <ul className="absolute z-50 w-full bg-popover border text-popover-foreground rounded-md mt-1 max-h-60 overflow-y-auto shadow-md">
              {data.map(({ place_id, description }) => (
                <li
                  key={place_id}
                  onClick={() => handleSelectAddress(description)}
                  className="px-3 py-2 hover:bg-accent hover:text-accent-foreground cursor-pointer text-sm border-b last:border-0"
                >
                  {description}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Live Interactive Map canvas */}
        <div className="w-full h-64 rounded-lg overflow-hidden border relative shadow-inner bg-muted">
          <Map
            center={mapCenter}
            zoom={zoom}
            onCenterChanged={(e) => setMapCenter(e.detail.center)}
            onZoomChanged={(e) => setZoom(e.detail.zoom)}
            mapId="BORLAGO_MAP_ID"
            disableDefaultUI={true}
            zoomControl={true}
          >
            <AdvancedMarker
              position={markerPosition}
              draggable={true}
              onDragEnd={handleMarkerDragEnd}
            />
          </Map>
          <div className="absolute bottom-2 left-2 bg-black/80 text-white text-[10px] px-2 py-1 rounded shadow-sm pointer-events-none">
            💡 Drag the pin to pinpoint your compound gate
          </div>
        </div>

      </div>
    </APIProvider>
  );
};