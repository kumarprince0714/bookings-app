import axios from "axios";

const API_KEY = import.meta.env.VITE_SERP_API_KEY;

// Function to fetch the db.json file
const USE_MOCK_DATA = false; // Toggle this to switch between mock and real API

const fetchMockData = async () => {
  try {
    // This assumes db.json is in the public folder of your React app
    const response = await fetch("/db2.json");
    if (!response.ok) {
      throw new Error("Failed to fetch mock data");
    }
    return await response.json();
  } catch (error) {
    console.error("Error loading mock data:", error);
    throw error;
  }
};

export const getSearchResults = async (
  departureId: string,
  arrivalId: string,
  outboundDate: string,
  returnDate: string,
  currency: string = "USD",
  hl: string = "en",
  travelClass: string = ""
) => {
  const flightType = returnDate ? "1" : "2";
  if (USE_MOCK_DATA) {
    try {
      console.log("Using mock data from db.json instead of remote API");

      // Load the mock data from db.json
      const mockData = await fetchMockData();

      // Find the route that matches departure and arrival
      const matchingRoute = mockData.routes.find(
        (route: any) =>
          route.origin === departureId && route.destination === arrivalId
      );

      if (!matchingRoute) {
        return {
          search_metadata: {
            status: "Success",
            created_at: new Date().toISOString(),
            id: "mock-search-" + Math.random().toString(36).substring(2, 9),
          },
          search_parameters: {
            departure_id: departureId,
            arrival_id: arrivalId,
            outbound_date: outboundDate,
            return_date: returnDate,
            currency: currency,
            travel_class: travelClass,
            hl: hl,
          },
          best_flights: [],
          cities: mockData.cities,
        };
      }

      // Map the nested flight data into a flat best_flights array.
      let best_flights: any[] = [];

      // For outbound flights
      if (matchingRoute.flights && matchingRoute.flights.length > 0) {
        const outboundFlights = matchingRoute.flights.flatMap(
          (routeFlight: any) =>
            routeFlight.flights.map((flight: any) => ({
              airline: flight.airline,
              flight_number: flight.flight_number,
              departure_time: flight.departure_airport?.time,
              arrival_time: flight.arrival_airport?.time,
              duration: flight.duration,
              price: routeFlight.price,
              flightType: "Outbound", // Explicitly mark as outbound
              type: "Outbound",
              stops: flight.stops ? flight.stops.length : 0,
              travel_class: travelClass,
            }))
        );
        best_flights = [...best_flights, ...outboundFlights];
      }

      // For return flights (if roundtrip)
      if (returnDate) {
        // Find the reverse route (from arrival back to departure)
        const returnRoute = mockData.routes.find(
          (route: any) =>
            route.origin === arrivalId && route.destination === departureId
        );

        if (returnRoute && returnRoute.flights) {
          const returnFlights = returnRoute.flights.flatMap(
            (routeFlight: any) =>
              routeFlight.flights.map((flight: any) => ({
                airline: flight.airline,
                flight_number: flight.flight_number,
                departure_time: flight.departure_airport?.time,
                arrival_time: flight.arrival_airport?.time,
                duration: flight.duration,
                price: routeFlight.price,
                flightType: "Return", // Explicitly mark as return
                type: "Return",
                stops: flight.stops ? flight.stops.length : 0,
                travel_class: travelClass,
              }))
          );
          best_flights = [...best_flights, ...returnFlights];
        }
      }

      // Format the response to mimic SerpAPI's structure
      const formattedResponse = {
        search_metadata: {
          status: "Success",
          created_at: new Date().toISOString(),
          id: "mock-search-" + Math.random().toString(36).substring(2, 9),
        },
        search_parameters: {
          departure_id: departureId,
          arrival_id: arrivalId,
          outbound_date: outboundDate,
          return_date: returnDate,
          currency: currency,
          travel_class: travelClass,
        },
        best_flights,
        cities: mockData.cities,
      };

      console.log("Mock API Response:", formattedResponse);
      return formattedResponse;
    } catch (error) {
      console.log("Error using mock flight data:", error);
      throw error;
    }
  } else {
    try {
      // Build the complete URL with parameters
      const serpApiUrl = `https://serpapi.com/search.json?engine=google_flights&departure_id=${departureId}&arrival_id=${arrivalId}&outbound_date=${outboundDate}&type=${flightType}${
        returnDate ? `&return_date=${returnDate}` : ""
      }&currency=${currency}&hl=${hl}&api_key=${API_KEY}`;

      // Use the proxy with the fully formed URL
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(
        serpApiUrl
      )}`;

      const response = await axios.get(proxyUrl);
      console.log("API Response:", response.data);
      return response.data;
    } catch (error) {
      console.log("Error fetching flight data:", error);
      throw error;
    }
  }
};
