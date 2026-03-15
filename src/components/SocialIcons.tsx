import React from "react";

const SocialIcons: React.FC = () => {
    const styles = {
      icon: {
        textDecoration: "none",
        fontSize: "22px",
        padding: "10px",
        transition: "0.2s ease-in",
      },
    };
  
    return (
      <div className="socialIcons">
        {/* <a className="icon" style={styles.icon} href="">
          <i className="fa-brands fa-github" aria-hidden="true" title="Raj Kukadia's GitHub Profile"></i>
        </a> */}
        <a className="icon" style={styles.icon} href="https://www.linkedin.com/in/raj-kukadia/">
          <i className="fa-brands fa-linkedin" aria-hidden="true" title="Raj Kukadia's LinkedIn Profile"></i>
        </a>
        {/* <a className="icon" style={styles.icon} href="">
          <i className="fa-brands fa-instagram" aria-hidden="true" title="Raj Kukadia's Instagram Profile"></i>
        </a>
        <a className="icon" style={styles.icon} href="">
          <i className="fa-brands fa-twitter" aria-hidden="true" title="Raj Kukadia's Twitter Profile"></i>
        </a> */}
      </div>
    );
  };
  
  export default SocialIcons;
