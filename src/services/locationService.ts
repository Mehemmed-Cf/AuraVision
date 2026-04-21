export interface AddressSuggestion {
  placeId: number;
  displayName: string;
  lat: number;
  lng: number;
}

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

interface OsrmResponse {
  routes?: Array<{
    distance: number;
    duration: number;
    geometry: {
      coordinates: [number, number][];
    };
  }>;
}

export async function searchNominatimAddress(query: string): Promise<AddressSuggestion[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const url = new URL('https://nominatim.openstreetmap.org/search');
  url.searchParams.set('q', trimmed);
  url.searchParams.set('format', 'json');
  url.searchParams.set('countrycodes', 'az');
  url.searchParams.set('limit', '5');

  const response = await fetch(url.toString(), {
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) return [];
  const data = (await response.json()) as NominatimResult[];
  return data.map((item) => ({
    placeId: item.place_id,
    displayName: item.display_name,
    lat: Number(item.lat),
    lng: Number(item.lon),
  }));
}

export async function fetchOsrmRoute(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number },
): Promise<{ distanceKm: number; durationMin: number; waypoints: [number, number][] } | null> {
  const url = `http://router.project-osrm.org/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`;
  const response = await fetch(url);
  if (!response.ok) return null;

  const data = (await response.json()) as OsrmResponse;
  const route = data.routes?.[0];
  if (!route) return null;

  const waypoints: [number, number][] = route.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
  return {
    distanceKm: route.distance / 1000,
    durationMin: route.duration / 60,
    waypoints,
  };
}
