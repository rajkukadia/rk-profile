import PhaserGame from "../../game/PhaserGame";
import React from "react";

interface LandingProps {
  name: string;
  tagline: string;
}

const Landing: React.FC<LandingProps> = ({ name, tagline }) => {
  return (
    <section style={{ margin: 0, padding: 0, overflow: "hidden" }}>
      <PhaserGame />
    </section>
  );
};

export default Landing;
