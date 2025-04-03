// useSearchResults.ts

import { useState, useEffect } from "react";
import { getSearchResults } from "./useSearchResultsService";

export const useSearchResults = (
  departureId: string,
  arrivalId: string,
  outboundDate: string,
  returnDate: string,
  currency: string = "USD",
  language: string = "en"
) => {
  const [searchResults, setSearchResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    if (!departureId || !arrivalId || !outboundDate) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await getSearchResults(
        departureId,
        arrivalId,
        outboundDate,
        returnDate,
        currency,
        language
      );
      setSearchResults(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const refetch = () => {
    fetchData();
  };

  return { searchResults, isLoading, error, refetch };
};
