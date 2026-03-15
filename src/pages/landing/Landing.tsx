import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import SocialIcons from "../../components/SocialIcons";
import React from "react";

interface LandingProps {
  name: string;
  tagline: string;
}

const Landing: React.FC<LandingProps> = ({ name, tagline }) => {
  const styles = {
    landing: {
      height: "calc(100% - 93px)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    },

    landingImage: {
      position: "absolute" as const,
      bottom: "0",
      opacity: "0.3",
      mixBlendMode: "lighten" as const,
      height: "80%",
    },

    textContainer: {
      display: "flex",
      flexDirection: "column" as const,
      letterSpacing: "1px",
      textAlign: "center" as const,
      zIndex: "1",
      color: "#fff",
      textShadow: "1px 1px 3px #000",
    },

    name: {
      color: "#fff",
      fontWeight: "700",
      marginTop: "-100px",
      paddingBottom: "28px",
    },
  };

  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  return (
    <section className="landing" style={styles.landing}>
      <div className="textContainer" style={styles.textContainer}>
        <motion.h1
          ref={ref as any}
          initial={{ y: "-10vw", opacity: 0 }}
          animate={inView ? { y: 0, opacity: 1 } : { y: "-10vw", opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          style={styles.name}
        >
          {name}
        </motion.h1>
        <motion.p
          ref={ref as any}
          initial={{ y: "10vw", opacity: 0 }}
          animate={inView ? { y: 0, opacity: 1 } : { y: "10vw", opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        >
          {tagline}
        </motion.p>
      </div>

      <SocialIcons />
    </section>
  );
};

export default Landing;
