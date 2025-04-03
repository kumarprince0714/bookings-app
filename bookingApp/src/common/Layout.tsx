import { BrowserRouter, Route, Routes } from "react-router-dom";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import FlightSearchPage from "../components/FlightSearchPage";
import Header from "./Header";
const Layout = () => {
  const queryClient = new QueryClient();

  return (
    <>
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <div className="flex flex-col min-h-[100vh]">
            <Header />
            <Routes>
              <Route path="/" element={<FlightSearchPage />} />
            </Routes>
          </div>
        </QueryClientProvider>
      </BrowserRouter>
    </>
  );
};

export default Layout;
