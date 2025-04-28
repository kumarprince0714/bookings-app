//FlightsFilter.tsx
import { useState } from "react";

const FlightsFilter: React.FC = () => {
  // Outbound city time filters
  const [outboundEarlyMorning, setOutboundEarlyMorning] = useState(false);
  const [outboundMorning, setOutboundMorning] = useState(false);
  const [outboundAfternoon, setOutboundAfternoon] = useState(false);
  const [outboundNight, setOutboundNight] = useState(false);

  // Inbound city time filters
  const [inboundEarlyMorning, setInboundEarlyMorning] = useState(false);
  const [inboundMorning, setInboundMorning] = useState(false);
  const [inboundAfternoon, setInboundAfternoon] = useState(false);
  const [inboundNight, setInboundNight] = useState(false);

  const [departPrice, setDepartPrice] = useState(1000);
  const [returnPrice, setReturnPrice] = useState(1000);

  return (
    <div className="w-full h-auto bg-blue-100 flex flex-wrap justify-between items-center px-2 py-2 gap-2 ">
      <div className="flex flex-col city items-start">
        <strong>Departure from: Outbound</strong>
        <label className="flex items-center mt-1">
          <input
            type="checkbox"
            checked={outboundEarlyMorning}
            onChange={(e) => setOutboundEarlyMorning(e.target.checked)}
            className="mr-2"
          />
          Early morning - 12 am to 6am
        </label>
        <label className="flex items-center mt-1">
          <input
            type="checkbox"
            checked={outboundMorning}
            onChange={(e) => setOutboundMorning(e.target.checked)}
            className="mr-2"
          />
          Morning - 6 am to 12pm
        </label>
        <label className="flex items-center mt-1">
          <input
            type="checkbox"
            checked={outboundAfternoon}
            onChange={(e) => setOutboundAfternoon(e.target.checked)}
            className="mr-2"
          />
          Afternoon - 12 pm to 6pm
        </label>
        <label className="flex items-center mt-1">
          <input
            type="checkbox"
            checked={outboundNight}
            onChange={(e) => setOutboundNight(e.target.checked)}
            className="mr-2"
          />
          Night - 6 pm to 12am
        </label>
      </div>
      <div className="flex flex-col city items-start">
        <strong>Departure from: Return</strong>
        <label className="flex items-center mt-1">
          <input
            type="checkbox"
            checked={inboundEarlyMorning}
            onChange={(e) => setInboundEarlyMorning(e.target.checked)}
            className="mr-2"
          />
          Early morning - 12am to 6am
        </label>
        <label className="flex items-center mt-1">
          <input
            type="checkbox"
            checked={inboundMorning}
            onChange={(e) => setInboundMorning(e.target.checked)}
            className="mr-2"
          />
          Morning - 6am to 12pm
        </label>
        <label className="flex items-center mt-1">
          <input
            type="checkbox"
            checked={inboundAfternoon}
            onChange={(e) => setInboundAfternoon(e.target.checked)}
            className="mr-2"
          />
          Morning - 12pm to 6am
        </label>
        <label className="flex items-center mt-1">
          <input
            type="checkbox"
            checked={inboundNight}
            onChange={(e) => setInboundNight(e.target.checked)}
            className="mr-2"
          />
          Night - 6pm to 12am
        </label>
      </div>
      <div className="flex flex-col price items-center">
        <strong>Onward Price range</strong>
        <input
          type="range"
          min="100"
          max="5000"
          value={departPrice}
          onChange={(e) => setDepartPrice(Number(e.target.value))}
          className="mt-2 w-32"
        />
        <span className="text-sm">{departPrice}</span>
      </div>
      <div className="flex flex-col price items-center">
        <strong>Return Price range</strong>
        <input
          type="range"
          min="100"
          max="5000"
          value={returnPrice}
          onChange={(e) => setReturnPrice(Number(e.target.value))}
          className="mt-2 w-32"
        />
        <span className="text-sm">{returnPrice}</span>
      </div>
    </div>
  );
};
export default FlightsFilter;
