import React from 'react';
import {BrowserRouter as Router, Routes, Route, Navigate} from 'react-router-dom';
import Body from "./Body"

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Body/>}/>
        {/*<Route path="*" element={<Navigate to="/"/>}/>*/}
      </Routes>
    </Router>
  );
}

export default App;
