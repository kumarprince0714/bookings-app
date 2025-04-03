import { Link } from "react-router-dom";
const Header = () => {
  return (
    <>
      <div className="fixed left-0 top-0 z-0 w-full bg-[#2874f0] h-[89px] flex items-center px-4">
        <Link to="/">
          <h2 className="text-4xl text-white font-bold">bookings.com</h2>
        </Link>
      </div>
    </>
  );
};

export default Header;
