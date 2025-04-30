// src/pages/FlightSearchPage.tsx
import React, { useState, useEffect, ChangeEvent } from "react";
import { TbArrowsExchange2 } from "react-icons/tb";
import { GiCommercialAirplane } from "react-icons/gi";
import { IoSearch } from "react-icons/io5";
import dayjs from "dayjs";

import { useSearchResults } from "../api/useSearchResults";
import {
  BestFlight,
  AirportOption,
  TravelClassOption,
  FilterState,
} from "../types/types";

// Airport dropdown options
const airports: AirportOption[] = [
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

// Travel-class dropdown options
const travelClasses: TravelClassOption[] = [
  { value: "", label: "All Classes" },
  { value: "economy", label: "Economy" },
  { value: "premium_economy", label: "Premium Economy" },
  { value: "business", label: "Business" },
  { value: "first", label: "First Class" },
];

const FlightSearchPage: React.FC = () => {
  // --- State (unchanged) ---
  const [tripType, setTripType] = useState<"oneWay" | "roundTrip">("roundTrip");
  const [departureId, setDepartureId] = useState("");
  const [arrivalId, setArrivalId] = useState("");
  const [departDate, setDepartDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [currency] = useState("USD");
  const [language] = useState("en");
  const [travelClass, setTravelClass] = useState("");

  const [searchTriggered, setSearchTriggered] = useState(false);
  const [selectedOutboundIndex, setSelectedOutboundIndex] = useState<
    number | null
  >(null);
  const [selectedReturnIndex, setSelectedReturnIndex] = useState<number | null>(
    null
  );

  const { searchResults, isLoading, error, refetch } = useSearchResults(
    departureId,
    arrivalId,
    departDate,
    tripType === "roundTrip" ? returnDate : "",
    currency,
    language,
    travelClass
  );

  useEffect(() => {
    if (searchResults) {
      setSelectedOutboundIndex(null);
      setSelectedReturnIndex(null);
    }
  }, [searchResults]);

  // --- Handlers (unchanged) ---
  const handleTripTypeChange = (e: ChangeEvent<HTMLInputElement>) =>
    setTripType(e.target.value as any);
  const handleSelectDeparture = (e: ChangeEvent<HTMLSelectElement>) =>
    setDepartureId(e.target.value);
  const handleSelectArrival = (e: ChangeEvent<HTMLSelectElement>) =>
    setArrivalId(e.target.value);
  const handleDepartDateChange = (e: ChangeEvent<HTMLInputElement>) =>
    setDepartDate(e.target.value);
  const handleReturnDateChange = (e: ChangeEvent<HTMLInputElement>) =>
    setReturnDate(e.target.value);
  const handleTravelClassChange = (e: ChangeEvent<HTMLSelectElement>) =>
    setTravelClass(e.target.value);
  const handleSwap = () => {
    const tmp = departureId;
    setDepartureId(arrivalId);
    setArrivalId(tmp);
  };
  const handleSearch = () => {
    if (
      tripType === "roundTrip" &&
      returnDate &&
      dayjs(returnDate).isBefore(dayjs(departDate))
    ) {
      alert("Return date must be after departure date");
      return;
    }
    setSearchTriggered(true);
    refetch();
  };
  const handleBooking = () => {
    if (tripType === "oneWay") {
      if (selectedOutboundIndex === null)
        return alert("Select an outbound flight");
      alert(`Booking one-way flight #${selectedOutboundIndex + 1}`);
    } else {
      if (selectedOutboundIndex === null || selectedReturnIndex === null)
        return alert("Select both outbound and return flights");
      alert(
        `Booking outbound #${selectedOutboundIndex + 1} and return #${
          selectedReturnIndex + 1
        }`
      );
    }
  };

  // --- Rendering helpers (unchanged) ---
  const renderFlightCard = (
    flight: BestFlight,
    index: number,
    isOutbound: boolean
  ) => {
    const isSelected = isOutbound
      ? selectedOutboundIndex === index
      : selectedReturnIndex === index;
    const onSelect = () =>
      isOutbound
        ? setSelectedOutboundIndex(index)
        : setSelectedReturnIndex(index);

    return (
      <div
        key={index}
        className={`div2 lg:py-4 rounded shadow-lg mb-4 w-[80vw] md:w-auto ${
          isSelected ? "bg-blue-100 border-2 border-blue-300" : "bg-gray-100"
        }`}
      >
        <div className="flex flex-col">
          <div className="div1 flex flex-col lg:flex-row px-1">
            <div className="flex justify-end">
              <input
                type="radio"
                name={isOutbound ? "outboundFlight" : "returnFlight"}
                checked={isSelected}
                onChange={onSelect}
                className="radio1 h-5 w-5 cursor-pointer flex m-2"
              />
            </div>

            <div className="flex mr-2">
              {flight.airline_logo && (
                <img
                  src={flight.airline_logo}
                  alt={flight.airline}
                  className="h-10 w-10 mx-2"
                />
              )}
            </div>

            <div className="flex flex-col items-start lg:mx-auto">
              <p>
                <strong>Airline:</strong> {flight.airline}
              </p>
              <p>
                <strong>Flight No:</strong> {flight.flight_number}
              </p>
            </div>

            <div className="flex flex-col items-start lg:mx-auto">
              <p>
                <strong>Departure:</strong> {flight.departure_time}
              </p>
              <p>
                <strong>Arrival:</strong> {flight.arrival_time}
              </p>
              <p>
                <strong>Duration:</strong> {flight.duration}
              </p>
            </div>

            <div className="flex flex-col items-start lg:mx-auto">
              <p>
                <strong>Price:</strong> ${flight.price}
              </p>
              <p>
                <strong>Type:</strong> {flight.type}
              </p>
              <p>
                <strong>Class:</strong> {flight.travel_class}
              </p>
            </div>
          </div>

          <div className="mt-2 flex flex-col lg:flex-row justify-between p-2">
            <p className="w-full text-left">
              <strong>Additional info & amenities:</strong>{" "}
              {flight.extensions.join(", ")}
            </p>
          </div>
        </div>
      </div>
    );
  };

  const renderFlights = () => {
    if (!searchTriggered) return null;
    if (isLoading)
      return <p className="text-center">Loading search results...</p>;
    if (error)
      return (
        <div className="text-red-500 p-4 border border-red-300 rounded bg-red-50">
          <h3 className="font-bold">Error loading search results:</h3>
          <p>{error.message}</p>
        </div>
      );
    if (!searchResults || searchResults.best_flights.length === 0) {
      return (
        <div className="mt-4">
          <p>No flights found for your search criteria.</p>
        </div>
      );
    }

    const outboundFlights = searchResults.best_flights.filter(
      (f) => f.type === "Outbound"
    );
    const returnFlights = searchResults.best_flights.filter(
      (f) => f.type === "Return"
    );

    return (
      <>
        {outboundFlights.length > 0 && (
          <>
            <h3 className="text-lg font-medium mb-3">
              Outbound Flights ({dayjs(departDate).format("MMM D, YYYY")})
              {travelClass &&
                ` - ${
                  travelClasses.find((c) => c.value === travelClass)?.label
                }`}
            </h3>
            {outboundFlights.map((f, i) => renderFlightCard(f, i, true))}
          </>
        )}

        {tripType === "roundTrip" && (
          <>
            <h3 className="text-lg font-medium my-4">
              Return Flights ({dayjs(returnDate).format("MMM D, YYYY")})
              {travelClass &&
                ` - ${
                  travelClasses.find((c) => c.value === travelClass)?.label
                }`}
            </h3>
            {returnFlights.map((f, i) => renderFlightCard(f, i, false))}
          </>
        )}

        <div className="mt-6 flex justify-center">
          <button
            onClick={handleBooking}
            disabled={
              tripType === "oneWay"
                ? selectedOutboundIndex === null
                : selectedOutboundIndex === null || selectedReturnIndex === null
            }
            className={`p-3 flex items-center justify-center rounded text-white ${
              tripType === "oneWay"
                ? selectedOutboundIndex !== null
                  ? "bg-blue-500 hover:bg-blue-600"
                  : "bg-gray-400 cursor-not-allowed"
                : selectedOutboundIndex !== null && selectedReturnIndex !== null
                ? "bg-blue-500 hover:bg-blue-600"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            <GiCommercialAirplane className="mr-2" size={24} />
            {tripType === "oneWay"
              ? "Book Selected Flight"
              : "Book Selected Flights"}
          </button>
        </div>
      </>
    );
  };

  return (
    <div className="h-auto mt-[5vh] flex flex-col items-center justify-center">
      <div className="w-fit md:border rounded border-black flex flex-col items-start md:items-center p-4 min-h-40 h-auto mt-10 mx-auto">
        {/* --- Flight Option --- */}
        <div className="flex items-center flex-col">
          <div className="row1 mb-4 flex items-start">
            <label className="mr-4">
              <input
                type="radio"
                name="flightOption"
                value="oneWay"
                checked={tripType === "oneWay"}
                onChange={handleTripTypeChange}
                className="mr-2"
              />
              One Way
            </label>
            <label>
              <input
                type="radio"
                name="flightOption"
                value="roundTrip"
                checked={tripType === "roundTrip"}
                onChange={handleTripTypeChange}
                className="mr-2"
              />
              Round Trip
            </label>
          </div>

          {/* --- Search Fields --- */}
          <div className="row2 my-4 flex-col flex lg:flex-row gap-4">
            <div className="flex w-auto">
              <div className="flex items-center border border-gray-300 p-2 w-[35vw] md:w-[25vw] lg:w-auto">
                <select
                  value={departureId}
                  onChange={handleSelectDeparture}
                  className="bg-transparent outline-none w-auto text-sm"
                >
                  <option value="">From (Select Airport)</option>
                  {airports.map((city) => (
                    <option key={city.code} value={city.code}>
                      {city.name} ({city.code})
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleSwap}
                className="p-1 bg-gray-200 rounded flex items-center w-7 lg:w-auto mx-1"
              >
                <TbArrowsExchange2 size={20} />
              </button>

              <div className="flex items-center border border-gray-300 p-2 w-[35vw] md:w-[25vw] lg:w-auto">
                <select
                  value={arrivalId}
                  onChange={handleSelectArrival}
                  className="bg-transparent outline-none w-auto text-sm"
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
                value={departDate}
                onChange={handleDepartDateChange}
                required
                min={dayjs().format("YYYY-MM-DD")}
              />
            </div>

            {tripType === "roundTrip" && (
              <div className="border border-gray-300 p-2">
                <label className="mb-1 text-sm font-medium mr-2">
                  Return On:
                </label>
                <input
                  type="date"
                  className="outline-none"
                  value={returnDate}
                  onChange={handleReturnDateChange}
                  required
                  min={departDate || dayjs().format("YYYY-MM-DD")}
                />
              </div>
            )}

            <div className="border border-gray-300 p-2">
              <select
                value={travelClass}
                onChange={handleTravelClassChange}
                className="bg-transparent outline-none text-sm"
              >
                {travelClasses.map((tc) => (
                  <option key={tc.value} value={tc.value}>
                    {tc.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <button
                onClick={handleSearch}
                className="p-2 bg-blue-500 text-white flex items-center justify-center rounded w-full lg:w-[6vw]"
                disabled={
                  isLoading ||
                  !departureId ||
                  !arrivalId ||
                  !departDate ||
                  (tripType === "roundTrip" && !returnDate)
                }
              >
                <IoSearch className="mr-1" size={20} />
                {isLoading ? "Searching..." : "Search"}
              </button>
            </div>
          </div>
        </div>

        {/* --- Results Section --- */}
        {searchTriggered && (
          <div className="mt-8 w-full">{renderFlights()}</div>
        )}
      </div>
    </div>
  );
};

export default FlightSearchPage;
