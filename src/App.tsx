import AnimatedRoutes from "./components/AnimatedRoutes";
import { PersonalDetails } from './types';

function App() {
  const personalDetails: PersonalDetails = {
    name: "Raj Kukadia",
    location: "Boston, MA, USA",
    tagline: "I'm a Software Engineer",
    email: "rajkukadia1@gmail.com",
    availability: "",
    brand: "" 
  };

  return (
    <>
    <AnimatedRoutes personalDetails={personalDetails} />
    </>
  );
}

export default App;
