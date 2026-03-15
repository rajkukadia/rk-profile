import { Routes, Route, useLocation } from "react-router-dom";

import Landing from "../pages/landing/Landing";
import GameIntro from "../pages/intro/GameIntro";
import { PersonalDetails } from "../types";

interface AnimatedRoutesProps {
  personalDetails: PersonalDetails;
}

const AnimatedRoutes: React.FC<AnimatedRoutesProps> = ({ personalDetails }) => {
  const location = useLocation();

  return (
    <Routes location={location} key={location.pathname}>
      <Route path="/" element={<GameIntro />} />
      <Route path="/home" element={<Landing name={personalDetails.name} tagline={personalDetails.tagline} />} />
      {/* <Route
        path="/about"
        element={
          <About
            name={personalDetails.name}
            location={personalDetails.location}
            email={personalDetails.email}
            availability={personalDetails.availability}
            brand={personalDetails.brand}
          />
        }
      />
      <Route path="/portfolio" element={<Portfolio />} />
      <Route
        path="/contact"
        element={
          <Contact name={personalDetails.name} location={personalDetails.location} email={personalDetails.email} />
        }
      /> */}
    </Routes>
  );
};

export default AnimatedRoutes;
