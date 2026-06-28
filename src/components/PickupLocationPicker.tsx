import React, { useState } from "react";
import { Map, MapControls, MapMarker } from "@/components/ui/map";
import { MapPin } from "lucide-react";
import usePlacesAutocomplete, { getGeocode, getLatLng } from "use-places-autocomplete";

// MapLibre uses standard [Longitude, Latitude] ordering
const ACCRA_CENTER_LNG_LAT: [number, number] = [-0.1870, 5.6037];
// Google services still require the traditional { lat, lng } object format
const ACCRA_CENTER_GOOGLE = { lat: 5.6037, lng: -0.1870 };

interface PickupLocationPickerProps {
  onLocationSelected: (location: { address: string; lat: number; lng: number }) => void;
}

export const PickupLocationPicker: React.FC<PickupLocationPickerProps> = ({ onLocationSelected }) => {
  // Use a single cohesive state for the map canvas viewport to align with map.tsx
  const [viewport, setViewport] = useState({
    center: ACCRA_CENTER_LNG_LAT,
    zoom: 12,
    bearing: 0,
    pitch: 0,
  });
  
  const [markerPosition, setMarkerPosition] = useState<[number, number]>(ACCRA_CENTER_LNG_LAT);

  const {
    ready,
    value,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: {
      // Keep Google places local to Accra using its required object structure
      locationBias: { radius: 30000, center: ACCRA_CENTER_GOOGLE },
    },
    debounce: 300,
  });

  // Handle selecting an address from the drop-down list
  const handleSelectAddress = async (description: string) => {
    setValue(description, false);
    clearSuggestions();

    try {
      const results = await getGeocode({ address: description });
      const { lat, lng } = await getLatLng(results[0]);
      
      const newCoords: [number, number] = [lng, lat];
      setMarkerPosition(newCoords);
      
      // Update viewport matching the map implementation signature
      setViewport((prev) => ({
        ...prev,
        center: newCoords,
        zoom: 16,
      }));

      onLocationSelected({ address: description, lat, lng });
    } catch (error) {
      console.error("Geocoding error:", error);
    }
  };

  return (
    <div className="space-y-3 w-full">
      
      <div className="relative">
        <label className="block text-sm font-semibold text-muted-foreground mb-1.5">
          Pickup Address / GPS Location
        </label>
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={!ready}
          placeholder="Search for an address or find your location below..."
          className="w-full px-3 py-2 text-sm border rounded-md bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-sm"
        />
        
        {status === "OK" && (
          <ul className="absolute z-50 w-full bg-popover border text-popover-foreground rounded-md mt-1 max-h-60 overflow-y-auto shadow-lg">
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

      {/* Free Interactive Map canvas */}
      <div className="w-full h-64 rounded-lg overflow-hidden border relative shadow-inner bg-muted">
        <Map
          viewport={viewport}
          onViewportChange={setViewport}
        >
          <MapControls position="bottom-right" showZoom showLocate />
          
          {/* Custom marker using the required full long/lat property assignments */}
          <MapMarker 
            longitude={markerPosition[0]} 
            latitude={markerPosition[1]}
          >
            <div className="p-2 bg-primary text-primary-foreground rounded-full shadow-md animate-pulse">
              <MapPin className="h-5 w-5" />
            </div>
          </MapMarker>
        </Map>
        
        <div className="absolute bottom-2 left-2 bg-black/80 text-white text-[10px] px-2 py-1 rounded shadow-sm pointer-events-none z-10">
          📍 Map centered over your selected location point
        </div>
      </div>

    </div>
  );
};