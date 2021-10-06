import React from 'react';
import logo from './logo.svg';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          I am a software engineer based on the west coast of BC.  
        </p>
        <a
          className="App-link"
          href="mailto:kelvinfilyk@gmail.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          contact
        </a>
      </header>
    </div>
  );
}

export default App;
