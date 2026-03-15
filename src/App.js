import Header from './components/Header';
import AnimatedRoutes from "./components/AnimatedRoutes";
import { fairyDustCursor } from "cursor-effects";
import { useEffect } from "react"

function App() {
  const personalDetails = {
    name: "Raj Kukadia",
    location: "Boston, MA, USA",
    tagline: "I'm a Software Engineer",
    email: "rajkukadia1@gmail.com",
    availability: "",
    brand: "" 
  };

  useEffect(() => {
    new fairyDustCursor({
      colors: ["#ff0000", "#00ff00", "#0000ff"],
    })
  }, [])

  return (
    <>
    <Header/>
    <AnimatedRoutes personalDetails={personalDetails} />
    </>
  );
}

export default App;
