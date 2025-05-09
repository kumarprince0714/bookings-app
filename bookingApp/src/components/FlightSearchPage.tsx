// FlightSearchPage.tsx
import React, { useState, useEffect } from "react";
import { TbArrowsExchange2 } from "react-icons/tb";
import { GiCommercialAirplane } from "react-icons/gi";
import { IoSearch } from "react-icons/io5";
import dayjs from "dayjs";
import { useSearchResults } from "../api/useSearchResults";
import FlightsFilter, { FilterState } from "./FlightsFilter";

interface City {
  code: string;
  name: string;
}

const airports: City[] = [
  { code: "HKG", name: "Hong Kong" },
  { code: "PEK", name: "Beijing Capital" },
  { code: "ICN", name: "Seoul Incheon" },
  { code: "BLR", name: "Bangalore" },
  { code: "MAA", name: "Chennai" },
  { code: "CCU", name: "Kolkata" },
  { code: "PNQ", name: "Pune" },
  { code: "AMD", name: "Ahmedabad" },
  { code: "JFK", name: "New York JFK" },
  { code: "LAX", name: "Los Angeles" },
  { code: "LHR", name: "London Heathrow" },
  { code: "CDG", name: "Paris Charles de Gaulle" },
  { code: "DXB", name: "Dubai" },
  { code: "SIN", name: "Singapore Changi" },
  { code: "DEL", name: "Delhi" },
  { code: "BOM", name: "Mumbai" },
];

// Add travel class options
const travelClasses = [
  { value: "", label: "All Classes" },
  { value: "economy", label: "Economy" },
  { value: "premium_economy", label: "Premium Economy" },
  { value: "business", label: "Business" },
  { value: "first", label: "First Class" },
];

const FlightSearchPage: React.FC = () => {
  // State for flight search parameters
  const [selectedOption, setSelectedOption] = useState("roundTrip");
  const [departureId, setDepartureId] = useState("");
  const [arrivalId, setArrivalId] = useState("");
  const [departDate, setDepartDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [language, setLanguage] = useState("en");
  const [searchTriggered, setSearchTriggered] = useState(false);
  const [travelClass, setTravelClass] = useState("");

  // Use IDs to select flights instead of indices
  const [selectedOutboundFlightId, setSelectedOutboundFlightId] = useState<
    string | null
  >(null);
  const [selectedReturnFlightId, setSelectedReturnFlightId] = useState<
    string | null
  >(null);

  // Add new state for filters
  const [filters, setFilters] = useState<FilterState>({
    outboundEarlyMorning: false,
    outboundMorning: false,
    outboundAfternoon: false,
    outboundNight: false,
    inboundEarlyMorning: false,
    inboundMorning: false,
    inboundAfternoon: false,
    inboundNight: false,
    departPriceMax: 5000,
    returnPriceMax: 5000,
  });

  // Add filtered results state
  const [filteredOutboundFlights, setFilteredOutboundFlights] = useState<any[]>(
    []
  );
  const [filteredReturnFlights, setFilteredReturnFlights] = useState<any[]>([]);

  const { searchResults, isLoading, error, refetch } = useSearchResults(
    departureId,
    arrivalId,
    departDate,
    selectedOption === "roundTrip" ? returnDate : "",
    currency,
    language,
    travelClass
  );

  // Time category determination function with better format handling
  const getTimeCategory = (timeStr: string): string => {
    if (!timeStr) return "";

    // Normalize the time string by removing any extra spaces
    const normalizedTimeStr = timeStr.trim();

    let hour: number;

    // Handle formats with AM/PM (12-hour format)
    if (
      normalizedTimeStr.toUpperCase().includes("AM") ||
      normalizedTimeStr.toUpperCase().includes("PM")
    ) {
      const timePattern = /(\d{1,2}):(\d{2})\s*(AM|PM|am|pm)/;
      const match = normalizedTimeStr.match(timePattern);

      if (!match) {
        console.warn(`Invalid time format: ${timeStr}`);
        return "";
      }

      hour = parseInt(match[1], 10);
      const period = match[3].toUpperCase();

      // Convert 12-hour format to 24-hour format
      if (period === "PM" && hour < 12) hour += 12;
      if (period === "AM" && hour === 12) hour = 0;
    } else {
      // Handle 24-hour format (e.g., "14:45" or "14.45")
      const timePattern = /(\d{1,2})[:.](\d{2})/;
      const match = normalizedTimeStr.match(timePattern);

      if (!match) {
        console.warn(`Invalid time format: ${timeStr}`);
        return "";
      }

      hour = parseInt(match[1], 10);
    }

    // Categorize the time based on hour
    if (hour >= 0 && hour < 6) return "earlyMorning";
    if (hour >= 6 && hour < 12) return "morning";
    if (hour >= 12 && hour < 18) return "afternoon";
    return "night";
  };

  //Function for filtering flights by time
  const filterFlightsByTime = (
    flights: any[],
    timeFilters: {
      earlyMorning: boolean;
      morning: boolean;
      afternoon: boolean;
      night: boolean;
    }
  ) => {
    // Check if any time filter is active
    const anyTimeFilterActive = Object.values(timeFilters).some(
      (value) => value
    );

    // If no time filters are active, return all flights
    if (!anyTimeFilterActive) return flights;

    return flights.filter((flight: any) => {
      // Get departure time from wherever it exists in the flight object
      const departureTime =
        flight.departure_time ||
        (flight.flights && flight.flights[0]?.departure_airport?.time) ||
        "";

      // Get the time category
      const timeCategory = getTimeCategory(departureTime);

      // Check if the flight matches any of the active time filters
      const matchesFilter =
        (timeCategory === "earlyMorning" && timeFilters.earlyMorning) ||
        (timeCategory === "morning" && timeFilters.morning) ||
        (timeCategory === "afternoon" && timeFilters.afternoon) ||
        (timeCategory === "night" && timeFilters.night);

      return matchesFilter;
    });
  };

  // Effect for handling new search results
  useEffect(() => {
    if (searchResults) {
      console.log("Search Results:", searchResults);
      // Reset selected flights when new search results arrive
      setSelectedOutboundFlightId(null);
      setSelectedReturnFlightId(null);
    }
    if (error) {
      console.error("Search Error:", error);
    }
  }, [searchResults, error]);

  // Separate effect to prepare flight data with IDs
  useEffect(() => {
    if (!searchResults || !searchResults.best_flights) {
      setFilteredOutboundFlights([]);
      setFilteredReturnFlights([]);
      return;
    }

    // First, add unique IDs to all flights if they don't have them
    const flightsWithIds = searchResults.best_flights.map(
      (flight: any, index: number) => ({
        ...flight,
        uniqueId: flight.uniqueId || `flight-${index}`,
      })
    );

    // Separate outbound and return flights
    let outboundFlights = flightsWithIds.filter(
      (route: any) =>
        route.type === "Outbound" || route.flightType === "Outbound"
    );

    let returnFlights = flightsWithIds.filter(
      (route: any) => route.type === "Return" || route.flightType === "Return"
    );

    // If flights aren't specifically labeled, divide array in half
    if (
      outboundFlights.length === 0 &&
      returnFlights.length === 0 &&
      selectedOption === "roundTrip"
    ) {
      const halfIndex = Math.ceil(flightsWithIds.length / 2);
      outboundFlights = flightsWithIds.slice(0, halfIndex);
      returnFlights = flightsWithIds.slice(halfIndex);
    } else if (outboundFlights.length === 0 && selectedOption === "oneWay") {
      // For one-way, all flights are outbound
      outboundFlights = flightsWithIds;
    }

    // Apply time filters to outbound flights
    const timeFilteredOutbound = filterFlightsByTime(outboundFlights, {
      earlyMorning: filters.outboundEarlyMorning,
      morning: filters.outboundMorning,
      afternoon: filters.outboundAfternoon,
      night: filters.outboundNight,
    });

    // Apply price filter to outbound flights
    const priceFilteredOutbound = timeFilteredOutbound.filter((flight: any) => {
      const price = Number(flight.price) || 0;
      return price <= filters.departPriceMax;
    });

    // Apply time filters to return flights
    const timeFilteredReturn = filterFlightsByTime(returnFlights, {
      earlyMorning: filters.inboundEarlyMorning,
      morning: filters.inboundMorning,
      afternoon: filters.inboundAfternoon,
      night: filters.inboundNight,
    });

    const priceFilteredReturn = timeFilteredReturn.filter((flight: any) => {
      const price = Number(flight.price) || 0;
      return price <= filters.returnPriceMax;
    });

    setFilteredOutboundFlights(priceFilteredOutbound);
    setFilteredReturnFlights(priceFilteredReturn);
  }, [searchResults, filters, selectedOption]);

  // Separate effect to validate selected flights when filtered results change
  useEffect(() => {
    // Check if selected flights still exist in filtered results
    if (selectedOutboundFlightId !== null) {
      const outboundExists = filteredOutboundFlights.some(
        (flight) => flight.uniqueId === selectedOutboundFlightId
      );

      if (!outboundExists) {
        setSelectedOutboundFlightId(null);
      }
    }

    if (selectedReturnFlightId !== null) {
      const returnExists = filteredReturnFlights.some(
        (flight) => flight.uniqueId === selectedReturnFlightId
      );

      if (!returnExists) {
        setSelectedReturnFlightId(null);
      }
    }
  }, [
    filteredOutboundFlights,
    filteredReturnFlights,
    selectedOutboundFlightId,
    selectedReturnFlightId,
  ]);

  // Handlers for input changes
  const handleOptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedOption(e.target.value);
  };

  const handleDepartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawDate = e.target.value;
    setDepartDate(rawDate);
  };

  const handleReturnDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawDate = e.target.value;
    setReturnDate(rawDate);
  };

  const handleTravelClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTravelClass(e.target.value);
  };

  // Handle filter changes from FlightsFilter component
  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  const handleSearch = () => {
    if (
      selectedOption === "roundTrip" &&
      dayjs(returnDate).isBefore(dayjs(departDate))
    ) {
      alert("Return date must be after the departure date");
      return;
    }
    console.log("Search triggered with params:", {
      departure_id: departureId,
      arrival_id: arrivalId,
      outbound_date: departDate,
      return_date: selectedOption === "roundTrip" ? returnDate : "",
      currency,
      hl: language,
      travel_class: travelClass,
    });
    setSearchTriggered(true);
    refetch();
  };

  const swapLocations = () => {
    const temp = departureId;
    setDepartureId(arrivalId);
    setArrivalId(temp);
  };

  const handleBooking = () => {
    // Handle the booking process with the selected flights
    if (selectedOption === "oneWay" && selectedOutboundFlightId !== null) {
      const selectedFlight = filteredOutboundFlights.find(
        (flight) => flight.uniqueId === selectedOutboundFlightId
      );
      console.log("Booking one-way flight:", selectedFlight);
      // Implement booking logic
      alert(`Booking flight ${selectedOutboundFlightId}`);
    } else if (
      selectedOption === "roundTrip" &&
      selectedOutboundFlightId !== null &&
      selectedReturnFlightId !== null
    ) {
      const outboundFlight = filteredOutboundFlights.find(
        (flight) => flight.uniqueId === selectedOutboundFlightId
      );
      const returnFlight = filteredReturnFlights.find(
        (flight) => flight.uniqueId === selectedReturnFlightId
      );
      console.log("Booking round-trip flights:", {
        outbound: outboundFlight,
        return: returnFlight,
      });
      // Implement booking logic
      alert(
        `Booking outbound flight ${selectedOutboundFlightId} and return flight ${selectedReturnFlightId}`
      );
    } else {
      alert("Please select flights for your journey");
    }
  };

  // Helper function to render a list of flights with radio buttons
  const renderFlightList = (flights: any[], isOutbound: boolean) => {
    return flights.map((route: any) => {
      // Get the first flight from the nested flights array if available
      const flightDetail = route.flights && route.flights[0];

      // Determine if this flight is selected using the unique ID
      const isSelected = isOutbound
        ? selectedOutboundFlightId === route.uniqueId
        : selectedReturnFlightId === route.uniqueId;

      // Get the departure time and its category for display
      const departureTime =
        flightDetail?.departure_airport?.time || route.departure_time || "N/A";
      const timeCategory = getTimeCategory(departureTime);
      const timeCategoryDisplay = timeCategory
        ? `(${
            timeCategory === "earlyMorning"
              ? "Early Morning"
              : timeCategory === "morning"
              ? "Morning"
              : timeCategory === "afternoon"
              ? "Afternoon"
              : "Night"
          })`
        : "";

      return (
        <div
          key={route.uniqueId}
          className={`div2 lg:py-4 rounded shadow-lg mb-4 w-[80vw] md:w-auto ${
            isSelected ? "bg-blue-100 border-2 border-blue-300" : "bg-gray-100"
          }`}
        >
          <div className="flex flex-col">
            <div className="div1 flex flex-col lg:flex-row px-1">
              {/* Radio button for selection */}
              <div className="flex justify-end">
                <input
                  type="radio"
                  name={isOutbound ? "outboundFlight" : "returnFlight"}
                  checked={isSelected}
                  onChange={() => {
                    if (isOutbound) {
                      setSelectedOutboundFlightId(route.uniqueId);
                    } else {
                      setSelectedReturnFlightId(route.uniqueId);
                    }
                  }}
                  className="radio1 h-5 w-5 cursor-pointer flex m-2"
                />
              </div>

              <div className="flex mr-2">
                {flightDetail?.airline_logo ? (
                  <img
                    src={flightDetail.airline_logo}
                    alt={flightDetail.airline}
                    title={flightDetail.airline}
                    className="h-10 w-10 mx-2"
                  />
                ) : null}
              </div>

              <div className="flex flex-col items-start lg:mx-auto">
                <p>
                  <strong>Airline:</strong>{" "}
                  {flightDetail?.airline || route.airline || "N/A"}
                </p>
                <p>
                  <strong>Flight No:</strong>{" "}
                  {flightDetail?.flight_number || route.flight_number || "N/A"}
                </p>
              </div>
              <div className="flex flex-col items-start lg:mx-auto">
                <p>
                  <strong>Departure:</strong> {departureTime}{" "}
                  {timeCategoryDisplay}
                </p>
                <p>
                  <strong>Arrival:</strong>{" "}
                  {flightDetail?.arrival_airport?.time ||
                    route.arrival_time ||
                    "N/A"}
                </p>
                <p>
                  <strong>Duration:</strong>{" "}
                  {flightDetail?.duration || route.duration
                    ? `${flightDetail?.duration || route.duration} minutes`
                    : "N/A"}
                </p>
              </div>
              <div className="flex flex-col items-start lg:mx-auto">
                <p>
                  <strong>Price:</strong>{" "}
                  {route.price !== undefined ? `$${route.price}` : "N/A"}
                </p>
                <p>
                  <strong>Type:</strong>{" "}
                  {route.type || route.flightType || "N/A"}
                </p>
                <p>
                  <strong>Class:</strong> {flightDetail?.travel_class || "N/A"}
                </p>
              </div>
              <div className=""></div>
            </div>
            <div className="mt-2 flex flex-col lg:flex-row justify-between p-2">
              <p className="w-full text-left">
                <strong>Additional info & amenities:</strong>{" "}
                {flightDetail?.extensions?.join(", ") || "N/A"}
              </p>
            </div>
          </div>
        </div>
      );
    });
  };

  // Render flight search results based on the API response
  const renderFlights = () => {
    if (!searchResults) return null;

    if (searchResults.best_flights && searchResults.best_flights.length > 0) {
      // For round trips, we need to separate outbound and return flights
      if (selectedOption === "roundTrip") {
        return (
          <>
            <h3 className="text-lg font-medium mb-3">
              Outbound Flights ({dayjs(departDate).format("MMM D, YYYY")})
              {travelClass &&
                ` - ${
                  travelClasses.find((c) => c.value === travelClass)?.label
                }`}
              {filteredOutboundFlights.length !==
                searchResults.best_flights.length / 2 &&
                ` - ${filteredOutboundFlights.length} flights matching filters`}
            </h3>
            {filteredOutboundFlights.length > 0 ? (
              renderFlightList(filteredOutboundFlights, true)
            ) : (
              <p className="py-4 text-center">
                No outbound flights match your filters.
              </p>
            )}

            <h3 className="text-lg font-medium my-4">
              Return Flights ({dayjs(returnDate).format("MMM D, YYYY")})
              {travelClass &&
                ` - ${
                  travelClasses.find((c) => c.value === travelClass)?.label
                }`}
              {filteredReturnFlights.length !==
                searchResults.best_flights.length / 2 &&
                ` - ${filteredReturnFlights.length} flights matching filters`}
            </h3>
            {filteredReturnFlights.length > 0 ? (
              renderFlightList(filteredReturnFlights, false)
            ) : (
              <p className="py-4 text-center">
                No return flights match your filters.
              </p>
            )}

            {/* Booking button for round trip */}
            <div className="mt-6 flex justify-center">
              <button
                onClick={handleBooking}
                disabled={
                  selectedOutboundFlightId === null ||
                  selectedReturnFlightId === null
                }
                className={`p-3 flex items-center justify-center rounded text-white ${
                  selectedOutboundFlightId !== null &&
                  selectedReturnFlightId !== null
                    ? "bg-blue-500 hover:bg-blue-600"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
              >
                <GiCommercialAirplane className="mr-2" size={24} />
                Book Selected Flights
              </button>
            </div>
          </>
        );
      } else {
        // For one-way trips, render all flights
        return (
          <>
            {filteredOutboundFlights.length > 0 ? (
              renderFlightList(filteredOutboundFlights, true)
            ) : (
              <p className="py-4 text-center">No flights match your filters.</p>
            )}

            {/* Booking button for one-way */}
            <div className="mt-6 flex justify-center">
              <button
                onClick={handleBooking}
                disabled={selectedOutboundFlightId === null}
                className={`p-3 flex items-center justify-center rounded text-white ${
                  selectedOutboundFlightId !== null
                    ? "bg-blue-500 hover:bg-blue-600"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
              >
                <GiCommercialAirplane className="mr-2" size={24} />
                Book Selected Flight
              </button>
            </div>
          </>
        );
      }
    } else {
      return (
        <div className="mt-4">
          <p>No flights found for your search criteria.</p>
        </div>
      );
    }
  };

  return (
    <div className="h-auto mt-[5vh] flex flex-col items-center justify-center ">
      <div className="w-fit  md:border rounded border-black flex flex-col items-start md:items-center p-4 min-h-40 h-auto mt-10 mx-auto">
        {/* Flight Option Selection */}
        <div className="flex items-center flex-col">
          <div className="row1 mb-4 flex items-start ">
            <label className="mr-4">
              <input
                type="radio"
                name="flightOption"
                value="oneWay"
                checked={selectedOption === "oneWay"}
                onChange={handleOptionChange}
                className="mr-2"
              />
              One Way
            </label>
            <label>
              <input
                type="radio"
                name="flightOption"
                value="roundTrip"
                checked={selectedOption === "roundTrip"}
                onChange={handleOptionChange}
                className="mr-2"
              />
              Round Trip
            </label>
          </div>

          {/* Search Fields */}
          <div className="row2 my-4 flex-col flex lg:flex-row flex-nowrap gap-4 ">
            {/* Departure Airport */}
            <div className="flex w-auto">
              <div className="flex items-center border border-gray-300 p-2 w-[35vw] md:w-[25vw] lg:w-auto ">
                <select
                  className="bg-transparent outline-none w-auto text-sm"
                  value={departureId}
                  onChange={(e) => setDepartureId(e.target.value)}
                >
                  <option value="">From (Select Airport)</option>
                  {airports.map((city) => (
                    <option key={city.code} value={city.code}>
                      {city.name} ({city.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Swap Button */}
              <button
                onClick={swapLocations}
                className="p-1 bg-gray-200 rounded flex items-center w-7 lg:w-auto mx-1"
              >
                <TbArrowsExchange2 size={20} />
              </button>

              {/* Arrival Airport */}
              <div className="flex items-center border border-gray-300 p-2 w-[35vw] md:w-[25vw] lg:w-auto">
                <select
                  className="bg-transparent outline-none w-auto text-sm"
                  value={arrivalId}
                  onChange={(e) => setArrivalId(e.target.value)}
                >
                  <option value="">To (Select Airport)</option>
                  {airports.map((city) => (
                    <option key={city.code} value={city.code}>
                      {city.name} ({city.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="border border-gray-300 p-2">
              <label className="mb-1 mr-2 text-sm font-medium">
                Depart On:
              </label>
              <input
                type="date"
                className="outline-none"
                placeholder="Depart On "
                onChange={handleDepartDateChange}
                required
                min={dayjs().format("YYYY-MM-DD")}
              />
            </div>
            {selectedOption === "roundTrip" && (
              <div className="border border-gray-300 p-2">
                <label className="mb-1 text-sm font-medium mr-2">
                  Return On:
                </label>

                <input
                  type="date"
                  className="outline-none"
                  placeholder="Return On"
                  onChange={handleReturnDateChange}
                  required
                  min={departDate || dayjs().format("YYYY-MM-DD")}
                />
              </div>
            )}

            {/* Add travel class filter */}
            <div className="border border-gray-300 p-2">
              <select
                className="bg-transparent outline-none text-sm"
                value={travelClass}
                onChange={handleTravelClassChange}
              >
                {travelClasses.map((classOption) => (
                  <option key={classOption.value} value={classOption.value}>
                    {classOption.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="">
              <button
                onClick={handleSearch}
                className="p-2 bg-blue-500 text-white flex items-center justify-center rounded w-full lg:w-[6vw] h-full"
                disabled={
                  isLoading ||
                  !departureId ||
                  !arrivalId ||
                  !departDate ||
                  (selectedOption === "roundTrip" && !returnDate)
                }
              >
                <IoSearch className="mr-1" size={20} />{" "}
                {isLoading ? "Searching..." : "Search"}
              </button>
            </div>
          </div>
        </div>
        {/* Results Section */}
        {searchTriggered && (
          <div className="mt-8 w-full">
            {isLoading && (
              <p className="text-center">Loading search results...</p>
            )}
            {error && (
              <div className="text-red-500 p-4 border border-red-300 rounded bg-red-50">
                <h3 className="font-bold">Error loading search results:</h3>
                <p>{(error as Error).message}</p>
              </div>
            )}
            {searchResults && !isLoading && (
              <div className="mt-4">
                <div className="mb-2">
                  <FlightsFilter
                    onFilterChange={handleFilterChange}
                    isRoundTrip={selectedOption === "roundTrip"}
                  />
                </div>
                <div>
                  <h2 className="text-xl font-semibold mb-4">
                    Flight Results for {departureId} to {arrivalId}
                    {selectedOption === "oneWay"
                      ? ` on ${dayjs(departDate).format("MMM D, YYYY")}`
                      : ` (${dayjs(departDate).format("MMM D, YYYY")} - ${dayjs(
                          returnDate
                        ).format("MMM D, YYYY")})`}
                  </h2>
                  {renderFlights() || (
                    <p className="text-center p-4 border rounded">
                      No flights found for your search criteria.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FlightSearchPage;
