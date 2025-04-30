// src/api/useSearchResults.ts

import { useState, useCallback } from "react";
import { getSearchResults } from "./useSearchResultsService";
import { FlightSearchResponse, SearchResultsHook } from "../types/types";

export function useSearchResults(
  departureId: string,
  arrivalId: string,
  outboundDate: string,
  returnDate: string,
  currency = "USD",
  language = "en",
  travelClass = ""
): SearchResultsHook {
  const [searchResults, setSearchResults] =
    useState<FlightSearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!departureId || !arrivalId || !outboundDate) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await getSearchResults(
        departureId,
        arrivalId,
        outboundDate,
        returnDate || null,
        currency,
        language,
        travelClass
      );
      setSearchResults(data);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("An unknown error occurred")
      );
    } finally {
      setIsLoading(false);
    }
  }, [
    departureId,
    arrivalId,
    outboundDate,
    returnDate,
    currency,
    language,
    travelClass,
  ]);

  return {
    searchResults,
    isLoading,
    error,
    refetch: fetchData,
  };
}
