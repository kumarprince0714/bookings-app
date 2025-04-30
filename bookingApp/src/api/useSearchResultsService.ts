// src/api/useSearchResultService.ts
import axios from "axios";
import {
  SerpApiSearchResponse,
  SerpApiRawBestFlight,
  FlightSearchResponse,
  BestFlight,
  FlightDetails,
  MockData,
} from "../types/types";

// Pull the key from Vite’s env
const API_KEY = import.meta.env.VITE_SERP_API_KEY;
if (!API_KEY) {
  throw new Error(
    "Missing SERP API key. Please define VITE_SERP_API_KEY in your .env"
  );
}

// … rest of your mock-data logic …

export async function getSearchResults(
  departureId: string,
  arrivalId: string,
  outboundDate: string,
  returnDate: string | null,
  currency = "USD",
  hl = "en",
  travelClass = ""
): Promise<FlightSearchResponse> {
  // When USE_MOCK_DATA is false, build the live-API URL:
  const params = new URLSearchParams({
    engine: "google_flights",
    departure_id: departureId,
    arrival_id: arrivalId,
    outbound_date: outboundDate,
    type: returnDate ? "1" : "2",
    currency,
    hl,
    ...(returnDate ? { return_date: returnDate } : {}),
  });

  // **Use `API_KEY` directly**—no `process`
  const serpUrl = `https://serpapi.com/search.json?${params.toString()}&api_key=${API_KEY}`;

  const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(
    serpUrl
  )}`;

  const resp = await axios.get<SerpApiSearchResponse>(proxyUrl);
  const raw = resp.data;

  // Flatten SerpAPI’s nested flights
  const flatFlights = raw.best_flights.flatMap(
    ({ price, flights }, blockIndex) => {
      // blockIndex === 0 => Outbound, blockIndex === 1 => Return
      const direction: "Outbound" | "Return" =
        blockIndex === 0 ? "Outbound" : "Return";

      return flights.map((f) => ({
        airline: f.airline || "Unknown",
        flight_number:
          f.flight_number || `FL-${Math.floor(Math.random() * 1000)}`,
        departure_time: f.departure_time ?? f.departure_airport?.time ?? "N/A",
        arrival_time: f.arrival_time ?? f.arrival_airport?.time ?? "N/A",
        duration: f.duration || "N/A",
        price,
        flightType: direction,
        type: direction,
        stops: f.stops?.length || 0,
        travel_class: f.travel_class || "Economy",
        airline_logo: f.airline_logo,
        extensions: f.extensions || ["Checked baggage for a fee"],
      }));
    }
  );

  return {
    search_metadata: raw.search_metadata,
    search_parameters: raw.search_parameters,
    best_flights: flatFlights,
    cities: raw.cities,
  };
}
