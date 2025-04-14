import React, { useState, useEffect } from "react";
import { TbArrowsExchange2 } from "react-icons/tb";
import { GiCommercialAirplane } from "react-icons/gi";
import { IoSearch } from "react-icons/io5";
import dayjs from "dayjs";
import { useSearchResults } from "../api/useSearchResults";

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

const FlightSearchPage: React.FC = () => {
  // State for flight search parameters
  const [selectedOption, setSelectedOption] = useState("roundTrip");
  const [departureId, setDepartureId] = useState("");
  const [arrivalId, setArrivalId] = useState("");
  const [departDate, setDepartDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [travellers, setTravellers] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [language, setLanguage] = useState("en");
  const [searchTriggered, setSearchTriggered] = useState(false);

  const { searchResults, isLoading, error, refetch } = useSearchResults(
    departureId,
    arrivalId,
    departDate,
    selectedOption === "roundTrip" ? returnDate : "",
    currency,
    language
  );

  useEffect(() => {
    if (searchResults) {
      console.log("Search Results:", searchResults);
    }
    if (error) {
      console.error("Search Error:", error);
    }
  }, [searchResults, error]);

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

  const handleTravellersChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTravellers(e.target.value);
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
    });
    setSearchTriggered(true);
    refetch();
  };

  const swapLocations = () => {
    const temp = departureId;
    setDepartureId(arrivalId);
    setArrivalId(temp);
  };

  // Helper function to render a list of flights
  const renderFlightList = (flights: any[]) => {
    return flights.map((route: any, index: number) => {
      // Get the first flight from the nested flights array if available
      const flightDetail = route.flights && route.flights[0];

      return (
        <div
          key={index}
          className="div2 lg:p-4 rounded shadow-lg mb-4 w-[80vw] md:w-full bg-gray-100"
        >
          <div className="flex flex-col ">
            <div className="div1 flex flex-col lg:flex-row">
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
                  <strong>Departure:</strong>{" "}
                  {flightDetail?.departure_airport?.time ||
                    route.departure_time ||
                    "N/A"}
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
            </div>
            <div className="mt-2 flex flex-col lg:flex-row justify-between p-2">
              <p className="w-full text-left">
                <strong>Additional info & amenities:</strong>{" "}
                {flightDetail?.extensions?.join(", ") || "N/A"}
              </p>
              <button className="cursor-pointer p-2 bg-blue-500 text-white flex items-center justify-center rounded mt-2 lg:mt-0">
                Book
                <GiCommercialAirplane
                  className="ml-1 hidden lg:inline-block"
                  size={20}
                />
              </button>
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
        // Find outbound and return flights based on dates or flight type
        const outboundFlights = searchResults.best_flights.filter(
          (route: any) =>
            route.type === "Outbound" || route.flightType === "Outbound"
        );

        const returnFlights = searchResults.best_flights.filter(
          (route: any) =>
            route.type === "Return" || route.flightType === "Return"
        );

        // If the API doesn't specifically label flights as outbound/return,
        // we can assume the first half of flights are outbound and second half are return
        const halfIndex = Math.ceil(searchResults.best_flights.length / 2);
        const defaultOutbound =
          outboundFlights.length > 0
            ? outboundFlights
            : searchResults.best_flights.slice(0, halfIndex);
        const defaultReturn =
          returnFlights.length > 0
            ? returnFlights
            : searchResults.best_flights.slice(halfIndex);

        return (
          <>
            <h3 className="text-lg font-medium mb-3">
              Outbound Flights ({dayjs(departDate).format("MMM D, YYYY")})
            </h3>
            {renderFlightList(defaultOutbound)}

            <h3 className="text-lg font-medium my-4">
              Return Flights ({dayjs(returnDate).format("MMM D, YYYY")})
            </h3>
            {renderFlightList(defaultReturn)}
          </>
        );
      } else {
        // For one-way trips, render all flights
        return renderFlightList(searchResults.best_flights);
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
    <div className="h-auto mt-[5vh] flex flex-col items-center justify-center">
      <div className="w-[90vw] lg:w-[75vw] md:border rounded border-black flex flex-col items-start p-4 min-h-40 h-auto mt-10">
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
          <div className="row2 my-4 flex-col flex lg:flex-row flex-wrap gap-4">
            {/* Departure Airport */}
            <div className="flex w-auto">
              <div className="flex items-center border border-gray-300 p-2 w-[44vw] md:w-[25vw] lg:w-auto">
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
              <div className="flex items-center border border-gray-300 p-2 w-[44vw] md:w-[25vw] lg:w-auto">
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
            <div className="border border-gray-300 p-2 w-[20vw] lg:w-[12vw]">
              <input
                type="number"
                className="outline-none"
                placeholder="Travellers:"
                value={travellers}
                onChange={handleTravellersChange}
              />
            </div>
            <div className="">
              <button
                onClick={handleSearch}
                className="p-2 bg-blue-500 text-white flex items-center justify-center rounded w-full lg:w-[6vw]"
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
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FlightSearchPage;
