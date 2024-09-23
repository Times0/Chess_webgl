import React, { useState, useEffect } from "react";
import ChessGL from "./chess/ChessGL";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>ChessGL - 3D Chess Demo</h1>
        <ChessGL />
      </header>
    </div>
  );
}

export default App;
