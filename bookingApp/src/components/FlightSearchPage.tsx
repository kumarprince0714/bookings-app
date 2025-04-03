//FlightSearchPage.tsx
import React, { useState } from "react";
import { TbArrowsExchange2 } from "react-icons/tb";
import { useSearchResults } from "../api/useSearchResults";
import { IoSearch } from "react-icons/io5";
import dayjs from "dayjs";

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
  const [selectedOption, setSelectedOption] = useState("roundTrip");
  const [departureId, setDepartureId] = useState("");
  const [arrivalId, setArrivalId] = useState("");
  const [departDate, setDepartDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [formattedDepartDate, setFormattedDepartDate] = useState("");
  const [formattedReturnDate, setFormattedReturnDate] = useState("");
  const [travellers, setTravellers] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [language, setLanguage] = useState("en");

  // Search trigger state
  const [searchTriggered, setSearchTriggered] = useState(false);

  const { searchResults, isLoading, error, refetch } = useSearchResults(
    departureId,
    arrivalId,
    departDate,
    selectedOption === "roundTrip" ? returnDate : "",
    currency,
    language
  );

  // Debug logging
  React.useEffect(() => {
    if (searchResults) {
      console.log("Search Results:", searchResults);
    }
    if (error) {
      console.error("Search Error:", error);
    }
  }, [searchResults, error]);

  const handleOptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedOption(e.target.value);
  };

  const handleDepartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawDate = e.target.value;
    setDepartDate(rawDate);
    const formatted = dayjs(rawDate).format("D MMMM, ddd");
    setFormattedDepartDate(formatted);
  };

  const handleReturnDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawDate = e.target.value;
    setReturnDate(rawDate);
    const formatted = dayjs(rawDate).format("D MMM, ddd ");
    setFormattedReturnDate(formatted);
  };

  const handleTravellersChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTravellers(e.target.value);
  };

  const handleSearch = () => {
    console.log("Search triggered with params:", {
      departureId,
      arrivalId,
      departDate,
      returnDate: selectedOption === "roundTrip" ? returnDate : "",
    });
    setSearchTriggered(true);
    refetch();
  };

  const swapLocations = () => {
    const tempDeparture = departureId;
    setDepartureId(arrivalId);
    setArrivalId(tempDeparture);
  };

  // Helper function to check data structure and render flights
  const renderFlights = () => {
    if (!searchResults) return null;

    console.log("Rendering flights with data structure:", searchResults);

    // Check different possible data structures that SerpAPI might return
    if (searchResults.flights && searchResults.flights.length > 0) {
      return searchResults.flights.map((flight: any, index: number) => (
        <div key={index} className="border p-4 rounded shadow-sm mb-4">
          <p>Airline: {flight.airline || "N/A"}</p>
          <p>Departure: {flight.departure_time || "N/A"}</p>
          <p>Arrival: {flight.arrival_time || "N/A"}</p>
          <p>Price: {flight.price || "N/A"}</p>
          <p>Type: {flight.flightType || "N/A"}</p>
        </div>
      ));
    } else if (
      searchResults.best_flights &&
      searchResults.best_flights.length > 0
    ) {
      return searchResults.best_flights.map((flight: any, index: number) => (
        <div key={index} className="border p-4 rounded shadow-sm mb-4">
          <p>
            Airline: {flight.airline || flight.flight_details?.airline || "N/A"}
          </p>
          <p>Duration: {flight.duration || "N/A"}</p>
          <p>Price: {flight.price || "N/A"}</p>
          {flight.departure && <p>Departure: {flight.departure}</p>}
          {flight.arrival && <p>Arrival: {flight.arrival}</p>}
          <p>Type: {flight.flightType || "N/A"}</p>
        </div>
      ));
    } else {
      // Display raw data if structure is unexpected
      return (
        <div className="mt-4">
          <p>Data structure received:</p>
          <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto max-h-60">
            {JSON.stringify(searchResults, null, 2)}
          </pre>
        </div>
      );
    }
  };

  return (
    <>
      <div className="h-screen mt-[5vh] flex flex-col items-center justify-center">
        <div className="w-[88vw] lg:w-[75vw] h-auto border rounded border-black flex flex-col items-start p-4">
          <div className="row1">
            <label>
              <input
                type="radio"
                name="flightOption"
                value="oneWay"
                checked={selectedOption === "oneWay"}
                onChange={handleOptionChange}
                className="mr-2"
              />
              <p className="inline-block mr-2">One Way</p>
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
          <div className="row2 mt-10 flex flex-wrap">
            {/* Departure Dropdown */}
            <div className="flex mb-4 md:mb-0">
              <div className="border border-[#E4E4E4] flex items-center h-10 mr-1">
                <select
                  className="flex-grow bg-transparent outline-none w-[14vw] pl-2"
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
              <div
                className="flex items-center text-xl cursor-pointer z-4 border-x border-[#888484] rounded-full absolute ml-[13.5%] lg:ml-[13.75%] mt-2 bg-white text-[#212121]"
                onClick={swapLocations}
              >
                <TbArrowsExchange2 />
              </div>
              {/* Arrival Dropdown */}
              <div className="border border-[#E4E4E4] flex items-center h-10 mr-4">
                <select
                  className="flex-grow bg-transparent outline-none w-[14vw] pl-3"
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
            <div className="border border-[#E4E4E4] flex items-center h-10 mr-4 mb-4 md:mb-0">
              <input
                className="flex-grow bg-transparent outline-none w-[10vw] pl-2"
                placeholder="Depart On"
                type="date"
                onChange={handleDepartDateChange}
              />
            </div>
            {selectedOption === "roundTrip" && (
              <div className="border border-[#E4E4E4] flex items-center h-10 mr-4 mb-4 md:mb-0">
                <input
                  className="flex-grow bg-transparent outline-none w-[10vw] pl-2"
                  placeholder="Return On"
                  type="date"
                  onChange={handleReturnDateChange}
                />
              </div>
            )}
            <div className="border border-[#E4E4E4] flex items-center h-10 mr-4 mb-4 md:mb-0">
              <input
                className="flex-grow bg-transparent outline-none w-[14vw] pl-2"
                placeholder="Travellers"
                value={travellers}
                onChange={handleTravellersChange}
              />
            </div>
            <div className="flex px-2">
              <button
                className="bg-[#2874f0] text-white border rounded-sm px-4 flex items-center"
                onClick={handleSearch}
                disabled={
                  isLoading ||
                  !departureId ||
                  !arrivalId ||
                  !departDate ||
                  (selectedOption === "roundTrip" && !returnDate)
                }
              >
                <IoSearch /> &nbsp; {isLoading ? "Searching..." : "Search"}
              </button>
            </div>
          </div>

          {/* Results section with enhanced debugging */}
          {searchTriggered && (
            <div className="mt-8 w-full">
              {isLoading && (
                <p className="text-center">Loading search results...</p>
              )}

              {error && (
                <div className="text-red-500 p-4 border border-red-300 rounded bg-red-50">
                  <h3 className="font-bold">Error loading search results:</h3>
                  <p>{(error as Error).message}</p>
                  <p className="mt-2 text-sm">
                    Make sure your API key is valid and the airport codes are
                    correct.
                  </p>
                </div>
              )}

              {searchResults && !isLoading && (
                <div className="mt-4">
                  <h2 className="text-xl font-semibold mb-4">
                    Flight Results for {departureId} to {arrivalId}
                  </h2>

                  {renderFlights() || (
                    <p className="text-center p-4 border rounded">
                      No flights found for your search criteria
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default FlightSearchPage;
