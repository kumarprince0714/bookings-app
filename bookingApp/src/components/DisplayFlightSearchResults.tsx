//DisplayFlightSearchResults.tsx
import React, { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import dayjs from "dayjs";

import { useSearchResults } from "../api/useSearchResults";

const DisplayFlightSearchResults: React.FC = () => {
  const [searchParams] = useSearchParams();

  // Extract query parameters
  const departureId = searchParams.get("departureId") || "";
  const arrivalId = searchParams.get("arrivalId") || "";
  const departDate = searchParams.get("departDate") || "";
  const returnDate = searchParams.get("returnDate") || "";
  const travellers = searchParams.get("travellers") || "";
  const currency = searchParams.get("currency") || "USD";
  const language = searchParams.get("language") || "en";
  const flightType = searchParams.get("flightType") || "roundTrip";

  const { searchResults, isLoading, error, refetch } = useSearchResults(
    departureId,
    arrivalId,
    departDate,
    flightType === "roundTrip" ? returnDate : "",
    currency,
    language
  );

  // Optionally, trigger a refetch when the component mounts
  useEffect(() => {
    if (departureId && arrivalId && departDate) {
      refetch();
    }
  }, [departureId, arrivalId, departDate, returnDate, refetch]);

  // Helper function to render flight details (similar to FlightSearchPage)
  const renderFlights = () => {
    if (!searchResults) return null;
    if (searchResults.best_flights && searchResults.best_flights.length > 0) {
      return searchResults.best_flights.map((route: any, index: number) => {
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
    <div className="min-h-screen mt-4 flex flex-col items-center justify-center p-4">
      <h2 className="text-2xl font-bold mb-4">
        Flight Results for {departureId} to {arrivalId} on{" "}
        {dayjs(departDate).format("MMM D, YYYY")}
      </h2>

      {isLoading && <p>Loading search results...</p>}
      {error && (
        <div className="text-red-500 p-4 border border-red-300 rounded bg-red-50">
          <h3 className="font-bold">Error loading search results:</h3>
          <p>{(error as Error).message}</p>
        </div>
      )}
      {searchResults && !isLoading && renderFlights()}
    </div>
  );
};

export default DisplayFlightSearchResults;
