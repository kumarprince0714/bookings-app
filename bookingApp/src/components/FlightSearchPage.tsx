import React, { useState, useEffect } from "react";
import { TbArrowsExchange2 } from "react-icons/tb";
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

  // Render flight search results based on the API response
  const renderFlights = () => {
    if (!searchResults) return null;
    if (searchResults.best_flights && searchResults.best_flights.length > 0) {
      return searchResults.best_flights.map((route: any, index: number) => {
        // Get the first flight from the nested flights array if available
        const flightDetail = route.flights && route.flights[0];

        return (
          <div key={index} className="border p-4 rounded shadow-sm mb-4">
            <p>
              <strong>Airline:</strong> {flightDetail?.airline || "N/A"}
            </p>
            <p>
              <strong>Flight No:</strong> {flightDetail?.flight_number || "N/A"}
            </p>
            <p>
              <strong>Duration:</strong>{" "}
              {flightDetail?.duration
                ? `${flightDetail.duration} minutes`
                : "N/A"}
            </p>
            <p>
              <strong>Price:</strong>{" "}
              {route.price !== undefined ? `$${route.price}` : "N/A"}
            </p>
            <p>
              <strong>Type:</strong> {route.type || "N/A"}
            </p>
          </div>
        );
      });
    } else {
      return (
        <div className="mt-4">
          <p>No flights found for your search criteria.</p>
        </div>
      );
    }
  };

  return (
    <div className="h-screen mt-[5vh] flex flex-col items-center justify-center">
      <div className="w-[88vw] lg:w-[75vw] border rounded border-black flex flex-col items-start p-4">
        {/* Flight Option Selection */}
        <div className="row1 mb-4">
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
        <div className="row2 mt-4 flex flex-wrap gap-4">
          {/* Departure Airport */}
          <div className="flex items-center border border-gray-300 p-2">
            <select
              className="bg-transparent outline-none"
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
            className="p-2 bg-gray-200 rounded flex items-center"
          >
            <TbArrowsExchange2 size={20} />
          </button>

          {/* Arrival Airport */}
          <div className="flex items-center border border-gray-300 p-2">
            <select
              className="bg-transparent outline-none"
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

        <div className="flex flex-wrap gap-4 mt-4">
          {/* Depart Date */}
          <div className="border border-gray-300 p-2">
            <input
              type="date"
              className="outline-none"
              placeholder="Depart On"
              onChange={handleDepartDateChange}
              required
              min={dayjs().format("YYYY-MM-DD")}
            />
          </div>
          {/* Return Date (if Round Trip) */}
          {selectedOption === "roundTrip" && (
            <div className="border border-gray-300 p-2">
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
          {/* Travellers */}
          <div className="border border-gray-300 p-2">
            <input
              type="number"
              className="outline-none"
              placeholder="Travellers"
              value={travellers}
              onChange={handleTravellersChange}
            />
          </div>
        </div>

        {/* Search Button */}
        <div className="mt-4">
          <button
            onClick={handleSearch}
            className="p-2 bg-blue-500 text-white flex items-center rounded"
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
                  Flight Results for {departureId} to {arrivalId} on{" "}
                  {dayjs(departDate).format("MMM D, YYYY")}
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
