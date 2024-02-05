import React, { Suspense, useRef, useState, useEffect } from "react";
import { Canvas, useThree, extend, useFrame } from "@react-three/fiber";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { BoxGeometry, RingGeometry } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { Chess } from "./Chess";
import { Vector3 } from "three";
import { Square } from "./Square";
import * as THREE from "three";
import "./ChessGL.css";

extend({ OrbitControls });
const white = 0xffffff;
const black = 0x333333;
const red = 0xff0000;

const thick = 0.1;

const AbsoluteToChessCoord = (position) => {
  if (position instanceof Vector3)
    return [Math.abs(position["x"] - 7 + 4), position["y"], position["z"] + 4];
};

const ChessToAbsoluteCoord = (position) => {
  if (position instanceof Vector3)
    return [Math.abs(position["x"] - 7) - 4, position["y"], position["z"] - 4];
  else if (position instanceof Square)
    return [Math.abs(position.getRow() - 7) - 4, 0, position.getLine() - 4];
};

const loadPieces = async () => {
  const pieces = [];
  let position = [0, 0, 0];
  const pieceName = ["r", "n", "b", "q", "k", "b", "n", "r"];
  const pieceNumber = [0, 0, 0, 0, 0, 1, 1, 1];
  // Load pawns and their corresponding pieces
  // using for and not foreach to allowed await
  for (let index = 0; index < pieceName.length; index++) {
    pieces.push(
      await loadModel(position, white, pieceName[index], pieceNumber[index])
    );
    pieces.push(await loadModel(position, white, "p", index));
    pieces.push(
      await loadModel(position, black, pieceName[index], pieceNumber[index], [
        0,
        Math.PI,
        0,
      ])
    );
    pieces.push(await loadModel(position, black, "p", index, [0, Math.PI, 0]));
  }

  return pieces;
};

// Function to create the chessboard
const drawChessboard = (handleChessClick) => {
  // Function to create a single square
  const createSquare = (x, z, color) => {
    if (color === "w") color = "white";
    else color = "black";

    const geometry = new BoxGeometry(1, thick, 1);
    const position = new Vector3(x, -thick / 2, z);

    return (
      <mesh
        key={`${x}-${z}`}
        geometry={geometry}
        position={position}
        onClick={(event) => {
          handleChessClick(event, position);
        }}
      >
        <meshStandardMaterial color={color} />
      </mesh>
    );
  };

  const squares = [];
  const colors = ["w", "b"];

  for (let x = -4; x < 4; x++) {
    for (let z = -4; z < 4; z++) {
      const color = colors[(x + z + 8) % 2];
      squares.push(createSquare(x, z, color));
    }
  }
  return squares;
};

const CameraControls = () => {
  const { camera, gl } = useThree();
  const controlsRef = useRef();
  camera.position.set(6, 5, 0);

  useFrame(() => controlsRef.current.update());

  return (
    <orbitControls
      ref={controlsRef}
      args={[camera, gl.domElement]}
      maxPolarAngle={Math.PI / 2}
    />
  );
};

// Only compares x and z
const findPieceByCoordinate = (pieces, position) => {
  return pieces.find(
    (piece) =>
      piece.position["x"] === position[0] && piece.position["z"] === position[1]
  );
};
const loadModel = (
  position,
  color,
  pieceName,
  pieceNumber,
  rotation = [0, 0, 0]
) => {
  const path = {
    r: "./ChessPieces/rook.glb",
    n: "./ChessPieces/knight.glb",
    b: "./ChessPieces/bishop.glb",
    q: "./ChessPieces/queen.glb",
    k: "./ChessPieces/king.glb",
    p: "./ChessPieces/pawn.glb",
  };

  return new Promise((resolve) => {
    const loader = new GLTFLoader();
    loader.load(path[pieceName], (gltf) => {
      const piece = gltf.scene;
      piece.position.set(position[0], position[1], position[2]);
      piece.scale.set(15, 15, 15);
      piece.rotation.set(rotation[0], rotation[1], rotation[2]);

      // Traverse through children to set color
      piece.traverse((child) => {
        if (child.isMesh && child.material) {
          const newMaterial = child.material.clone();
          newMaterial.color.setHex(color);
          child.material = newMaterial;
        }
      });

      let pieceColor = "w";
      if (color === black) pieceColor = "b";

      piece.userData = {
        type: pieceName,
        color: pieceColor,
        number: pieceNumber,
      };
      console.log("loaded");

      resolve(piece);
    });
  });
};
const ChessGL = () => {
  const findPieceIndexByCoordinate = (pieces, position) => {
    return pieces.findIndex(
      (piece) =>
        piece.position["x"] === position["x"] &&
        piece.position["z"] === position["z"]
    );
  };

  const isVectorInsideCases = (scase, moves) => {
    // Check if the move is inside any of the pieces
    for (const move of moves) {
      if (scase[0] === move.getRow() && scase[2] === move.getLine())
        return true;
    }
    return false;
  };

  const drawLegalCase = (legalCases) => {
    const createRing = (x, z, color) => {
      const geometry = new RingGeometry(0.32, 0.45, 32); // Adjust inner and outer radius as needed
      const position = new Vector3(x, 0.001, z); // Adjust the y position for thickness
      const rotation = [-Math.PI / 2, 0, 0];
      return (
        <mesh
          key={`${x}-${z}`}
          geometry={geometry}
          position={position}
          rotation={rotation}
        >
          <meshStandardMaterial color={color} />
        </mesh>
      );
    };

    let cases = [];
    legalCases.forEach((c) => {
      let position = ChessToAbsoluteCoord(c);
      cases.push(createRing(position[0], position[2], red));
    });
    return cases;
  };

  const removePiece = (tpiece) => {
    if (tpiece.userData["color"] === "w") {
      let ipos = [-5, 2.5];
      let t;
      while (
        (t = findPieceByCoordinate(pieces, ipos)) !== undefined &&
        t !== tpiece
      ) {
        if (ipos[1] - 1 < -3.5) {
          ipos[0] -= 1;
          ipos[1] = 2.5;
        } else ipos[1] -= 1;
      }
      tpiece.position.set(ipos[0], -thick, ipos[1]);
    } else {
      let ipos = [4, -3.5];
      let t;
      while (
        (t = findPieceByCoordinate(pieces, ipos)) !== undefined &&
        t !== tpiece
      ) {
        if (ipos[1] + 1 > 2.5) {
          ipos[0] += 1;
          ipos[1] = -3.5;
        } else ipos[1] += 1;
      }
      tpiece.position.set(ipos[0], -thick, ipos[1]);
    }
  };

  const DisplayChessGame = ({ game, pieces }) => {
    const handlePromote = async () => {
      let promotion = undefined;
      // if a promote piece is selected
      if (promotingPiece.current !== undefined) {
        if (startPieceRef.current === undefined) return undefined;

        const type = startPieceRef.current.userData["type"];
        if (type === "n" || type === "b" || type === "q" || type === "r") {
          const position = promotingPiece.current.position;
          const color =
            promotingPiece.current.userData["color"] === "w" ? white : black;
          const rotation =
            promotingPiece.current.userData["color"] === "w"
              ? [0, 0, 0]
              : [0, Math.PI, 0];
          const index = findPieceIndexByCoordinate(pieces, position);

          pieces[index] = await loadModel(
            [position["x"], 0, position["z"]],
            color,
            type,
            2,
            rotation
          );
          startPieceRef.current = pieces[index];
          promotion = type;
          promotingPiece.current = undefined;
        }
      }
      return promotion;
    };

    const handlePieceMove = async (game, pieces) => {
      let promotion = await handlePromote();

      // Put down all pieces
      pieces.forEach((piece) => {
        if (piece.position["y"] !== -thick) {
          piece.position["y"] = 0;
        }
      });
      setLegalCases([]);
      // Mount up selected piece
      let startPosition, endPosition;

      if (startPieceRef.current !== undefined) {
        startPieceRef.current.position["y"] = 1;
        startPosition = AbsoluteToChessCoord(startPieceRef.current.position);
        setLegalCases(
          game.getPieceMove(new Square(startPosition[2], startPosition[0]))
        );
      }

      if (
        startPieceRef.current !== undefined &&
        endCaseRef.current !== undefined
      ) {
        endPosition = AbsoluteToChessCoord(endCaseRef.current);
        if (startPieceRef.current.userData["type"] === "p") {
          if (endPosition[2] === 0 || endPosition[2] === 7) {
            let moveCases = game.getPieceMove(
              new Square(startPosition[2], startPosition[0])
            );
            if (isVectorInsideCases(endPosition, moveCases)) {
              promotingPiece.current = startPieceRef.current;
              setLegalCases([]);
              startPieceRef.current = undefined;
              return;
            }
          }
        }

        let r = game.move(
          new Square(startPosition[2], startPosition[0]),
          new Square(endPosition[2], endPosition[0]),
          promotion
        );
        if (r !== null) {
          updatePiecePosition(pieces, r, endCaseRef.current);

          startPieceRef.current = undefined;
          setLegalCases([]);
        }
        endCaseRef.current = undefined;
      }
    };

    const handleChessClick = (event, position) => {
      event.stopPropagation();
      console.log(position);
      console.log(AbsoluteToChessCoord(position));

      let tpiece = findPieceByCoordinate(pieces, [
        position["x"],
        position["z"],
      ]);

      // If click on the piece mounted up
      if (startPieceRef.current === tpiece) startPieceRef.current = undefined;
      else if (tpiece !== undefined) {
        // If click on a piece of the right color and the piece is on the board
        let tposition = AbsoluteToChessCoord(position);
        if (
          tpiece.userData["color"] === game.getTurn() &&
          tposition[0] >= 0 &&
          tposition[0] < 8
        )
          startPieceRef.current = tpiece;
        else if (startPieceRef.current !== undefined)
          endCaseRef.current = position;
      } else if (startPieceRef.current !== undefined)
        endCaseRef.current = position;

      handlePieceMove(game, pieces);
    };

    // Use position and not piece to be more general, and allow user to click on cases
    const startPieceRef = useRef(undefined);
    const endCaseRef = useRef(undefined);
    const [legalCases, setLegalCases] = useState([]);
    const promotingPiece = useRef(undefined);
    console.log("tick", chess.current);

    return (
      <>
        {drawChessboard(handleChessClick)}
        {pieces.map((piece, index) => (
          <primitive
            key={index}
            object={piece}
            onClick={(event) => {
              handleChessClick(event, piece.position);
            }}
          />
        ))}
        {drawLegalCase(legalCases)}
        {kingLight()}
      </>
    );
  };

  const [pieces, setPieces] = useState();
  const [game, setGame] = useState();
  const isMounted = useRef(false);
  const chess = useRef(undefined);

  const updatePiecePosition = (pieces, cmd, endCaseRef) => {
    console.log(cmd);

    let ref = cmd.split(",");
    let refMap = Array(64);
    let pieceMap = Array(32);

    //lumiere pour echec
    if (ref[64] === "chess")
      if (game.getTurn() === "w") chess.current = white;
      else chess.current = black;
    else chess.current = undefined;

    if (endCaseRef !== undefined) {
      let tpiece = findPieceByCoordinate(pieces, [
        endCaseRef["x"],
        endCaseRef["z"],
      ]);
      // if there is a take, remove the piece from the board
      if (tpiece !== undefined) removePiece(tpiece);
    }

    // pieceMap represents the pieces at the good place on the board
    pieces.forEach((piece, index) => {
      let position = AbsoluteToChessCoord(piece.position);
      if (
        piece.userData["type"] === ref[position[2] * 8 + position[0]][1] &&
        piece.userData["color"] === ref[position[2] * 8 + position[0]][0]
      ) {
        pieceMap[index] = 1;
        refMap[position[2] * 8 + position[0]] = 1;
      }
    });

    ref.forEach((elem, index) => {
      if (elem.length !== 0 && refMap[index] === undefined) {
        for (let index2 in pieces) {
          if (
            pieceMap[index2] === undefined &&
            elem[0] === pieces[index2].userData["color"] &&
            elem[1] === pieces[index2].userData["type"]
          ) {
            let position = AbsoluteToChessCoord(pieces[index2].position);
            if (position[0] >= 0 && position[0] < 8) {
              let p = ChessToAbsoluteCoord(
                new Vector3(index % 8, 0, (index - (index % 8)) / 8)
              );
              pieces[index2].position.set(p[0], p[1], p[2]);
              pieceMap[index2] = 1;
              break;
            }
          }
        }
      }
    });

    // remove piece who are no more on board
    pieces.forEach((piece, index) => {
      if (pieceMap[index] !== 1) removePiece(piece);
    });
  };

  const DisplayLights = ({}) => (
    <>
      <ambientLight intensity={1} />
      <spotLight position={[0, 10, 0]} intensity={1000} />

      {/* Side camera lights */}
      <spotLight position={[0, 0, 10]} intensity={300} />
      <spotLight position={[0, 0, -10]} intensity={300} />
      <spotLight position={[10, 0, 0]} intensity={300} />
      <spotLight position={[-10, 0, 0]} intensity={300} />
    </>
  );

  const kingLight = () => {
    if (chess.current !== undefined) {
      let color = chess.current === white ? "w" : "b";
      let king = pieces.find(
        (piece) =>
          piece.userData["type"] === "k" && piece.userData["color"] === color
      );

      const lightTarget = new THREE.Object3D();
      lightTarget.position.set(king.position["x"], 0, king.position["z"]);
      return (
        <>
          <spotLight
            position={
              new THREE.Vector3(king.position["x"], 2, king.position["z"])
            }
            target={lightTarget}
            intensity={1}
            color={new THREE.Color(255, 0, 0)}
          />
          <primitive object={lightTarget} />
        </>
      );
    }
  };

  // Skip the initial render
  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }

    setGame(new Chess(true));
    loadPieces().then((loadedPieces) => {
      setPieces(loadedPieces);
    });
  }, []);

  // Check if the pieces array is full
  useEffect(() => {
    if (pieces) {
      console.log("Pieces array is full:", pieces);
      updatePiecePosition(pieces, game.board.canonicalPosition(), undefined);
    }
  }, [pieces]);

  // Render the component once pieces are loaded
  if (!pieces) {
    // Return loading indicator or null
    return null;
  }

  return (
    <div className="ChessGL">
      <Canvas camera={{ position: [0, 0, 10] }}>
        <DisplayChessGame game={game} pieces={pieces} />
        <CameraControls />
        <DisplayLights />
      </Canvas>
    </div>
  );
};

export default ChessGL;
