import React, { useState, useEffect } from "react";
import logo from "./logo.svg";
import ChessGL from "./chess/ChessGL";
import Modal from "react-modal";
import "./ModalStyles.css"; // Import the new CSS file

function App() {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  const closeModal = () => {
    setModalIsOpen(false);
    setIsVisible(true);
  };

  useEffect(() => {
    setModalIsOpen(true);
    setIsVisible(false);
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>ChessGL - 3D Chess Demo</h1>
        <ChessGL isVisible={isVisible} />
      </header>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Welcome Modal"
        className="Modal" // Use the new CSS class
        overlayClassName="Overlay" // Use the new CSS class
      >
        <h2>Welcome to ChessGL!</h2>
        <p>
          Made mostly by the goat of react {""}
          <a
            href="https://www.lucas-deletang.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Lucas
          </a>
        </p>
        <button onClick={closeModal} className="close-button">
          Start playing
        </button>
      </Modal>
    </div>
  );
}

export default App;
