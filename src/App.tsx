import React from 'react';
import {BrowserRouter as Router, Route, Redirect} from 'react-router-dom';
import styles from "./style.css";
import doodle from "./doodle.jpg";
import email from "./email.png";
import linkedin from "./linkedin.png";
import github from "./github.png";


function Sep() {
  return (<var className={styles.sep}> | </var>);
}

function Plus() {
  return (<b className={styles.plus}>+</b>);
}

const App: React.FC = (props) => {
  return (
    <Router>
      <div className={styles.header}>
        <a className={styles.logo}>KELVIN FILYK</a>
        <a>KELVIN FILYK</a>

        <a href="https://github.com/kfilyk/s2mosaic">S2MOSAIC</a>
        <a href="https://github.com/kfilyk/cpp_accelerated_image_quantization">K-MEANS SEGMENTATION (C++)</a>
        <a href="https://certn-dash.herokuapp.com/">CERTN DASHBOARD</a>
        <a href="https://carechanger.herokuapp.com/">CARECHANGER</a>
        <a href="https://kfilyk.github.io/petri/">PETRI</a>
        <a>QUORACLE</a>
        <a>MORI DUNOM</a>
      </div>
      <Route path="/">
        <body className={styles.body}>
          <img src={doodle} className={styles.headshot} alt="headshot" />
          <p>
          <h1>I am a software engineer based on the west coast 🍁. </h1>
            C++ {Sep()} SQL {Sep()} Jenkins {Sep()} Git {Sep()} Go {Plus()} <br />
            Node {Sep()} Django {Sep()} React {Sep()} Typescript {Plus()}{Plus()} <br />
            Tensorflow {Sep()} PyTorch {Sep()} Keras {Sep()} OpenCV {Plus()}{Plus()}{Plus()}<br />
          </p>
          <div className={styles.link_container}>
          <a
            className={styles.link}
            href="mailto:kelvinfilyk@gmail.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src={email} height='40px'/>
          </a>
          <a
            className={styles.link}
            href="https://www.linkedin.com/in/kfilyk/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src={linkedin} height='40px'/>
          </a>
          <a
            className={styles.link}
            href="https://github.com/kfilyk"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src={github} height='40px'/>
          </a>
        </div>
        </body>
      </Route>
      <Route path="*"> <Redirect to="/" /></Route>
    </Router>
  );
}

export default App;
