// types.ts
export interface City {
  id: string;
  name: string;
  airport_name?: string;
  country?: string;
  code?: string;
}

export interface FlightStop {
  airport: string;
  time: string;
  duration?: string;
}

export interface Airport {
  name: string;
  id: string;
  time: string;
}

export interface FlightDetails {
  airline: string;
  flight_number: string;
  departure_airport?: Airport;
  arrival_airport?: Airport;
  departure_time?: string; // SerpAPI sometimes returns it flat
  arrival_time?: string; // ditto
  duration: string;
  stops?: FlightStop[];
  airline_logo?: string;
  travel_class?: string;
  extensions?: string[];
}

export interface RouteFlight {
  price: number;
  flights: FlightDetails[];
}

export interface Route {
  origin: string;
  destination: string;
  flights: RouteFlight[];
}

export interface BestFlight {
  airline: string;
  flight_number: string;
  departure_time: string;
  arrival_time: string;
  duration: string;
  price: number;
  flightType: "Outbound" | "Return";
  type: "Outbound" | "Return";
  stops: number;
  travel_class: string;
  airline_logo?: string;
  extensions?: string[];
}

export interface MockData {
  cities: City[];
  routes: Route[];
}

export interface SearchParameters {
  departure_id: string;
  arrival_id: string;
  outbound_date: string;
  return_date?: string;
  currency: string;
  travel_class?: string;
  hl?: string;
}

export interface SearchMetadata {
  status: string;
  created_at: string;
  id: string;
}

// This is the shape SerpAPI returns: an array of { price, flights: FlightDetails[] }
export interface SerpApiRawBestFlight {
  price: number;
  flights: FlightDetails[];
}

export interface SerpApiSearchResponse {
  search_metadata: SearchMetadata;
  search_parameters: SearchParameters;
  best_flights: SerpApiRawBestFlight[];
  cities: City[];
}

export interface FlightSearchResponse {
  search_metadata: SearchMetadata;
  search_parameters: SearchParameters;
  best_flights: BestFlight[];
  cities: City[];
}

// Filter types from FlightsFilter component
export interface FilterState {
  outboundEarlyMorning: boolean;
  outboundMorning: boolean;
  outboundAfternoon: boolean;
  outboundNight: boolean;
  inboundEarlyMorning: boolean;
  inboundMorning: boolean;
  inboundAfternoon: boolean;
  inboundNight: boolean;
  departPriceMax: number;
  returnPriceMax: number;
}

export interface FlightsFilterProps {
  onFilterChange: (filters: FilterState) => void;
  isRoundTrip: boolean;
}

// Add Airport interface for the dropdown selection
export interface AirportOption {
  code: string;
  name: string;
}

// Define TravelClassOption interface for travel class dropdown
export interface TravelClassOption {
  value: string;
  label: string;
}

//Define SearchResultsHook return type
export interface SearchResultsHook {
  searchResults: FlightSearchResponse | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}
