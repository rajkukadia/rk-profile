import NavLinks from "./NavLinks";
import logo from "../images/ai_profile_pic.JPG";

const Header: React.FC = () => {
  return (
    <header className="header">
      <img className="logo" src={logo} alt="RK" />
      <NavLinks />
    </header>
  );
};

export default Header;
