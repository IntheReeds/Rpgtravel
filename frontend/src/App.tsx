import { useState } from 'react'
//import RestaurantFinder from './findResturants'

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './Login';
import Travel from './Travel';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/main" element={<Travel />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
