import React, { useRef, useState, useEffect } from "react";
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

const thick = 1;

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

// Function to load all the pieces
const loadPieces = async () => {
  console.log("Loading pieces");
  const pieces = [];
  const pieceName = ["r", "n", "b", "q", "k"];
  const pieceNumber = [0, 0, 0, 0, 0];

  // load model only once for each piece
  for (let index = 0; index < pieceName.length; index++) {
    let model;
    if (pieceName[index] === "n") {
      model = await loadModel(
        white,
        pieceName[index],
        pieceNumber[index],
        Math.PI
      );
    } else {
      model = await loadModel(white, pieceName[index], pieceNumber[index]);
    }
    pieces.push(model);
  }

  // copy existing pieces to the other side of the board for white pieces
  const cloneAndRotatePiece = (piece, rotation) => {
    const clonedPiece = piece.clone();
    clonedPiece.rotation.set(0, clonedPiece.rotation.y + rotation, 0);
    return clonedPiece;
  };

  const right_bishop = cloneAndRotatePiece(pieces[2], Math.PI);
  const right_knight = cloneAndRotatePiece(pieces[1], 0);
  const right_rook = cloneAndRotatePiece(pieces[0], Math.PI);

  pieces.push(right_bishop, right_knight, right_rook);

  // load white pawns
  pieces.push(await loadModel(white, "p", 0));
  for (let index = 1; index < 8; index++) {
    pieces.push(pieces[8].clone());
    pieces[8 + index].userData["number"] = index;
  }

  // copy existing pieces to the other side of the board for black pieces
  for (let index = 0; index < 16; index++) {
    pieces.push(pieces[index].clone());
    changePieceColor(pieces[index + 16], black);
    pieces[index + 16].userData["color"] = "b";
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
      const color = colors[(x + z) % 2];
      squares.push(createSquare(x, z, color));
    }
  }
  return squares;
};

const CameraControls = () => {
  const { camera, gl } = useThree();
  const controlsRef = useRef();

  const animate = () => {
    controlsRef.current.update();
  };

  useFrame(animate);

  return (
    <orbitControls
      ref={controlsRef}
      args={[camera, gl.domElement]}
      maxPolarAngle={Math.PI / 2}
      minPolarAngle={Math.PI / 5}
      target={[-0.5, 0, -0.5]} // Look at the center of the board
      enableDamping
      rotateSpeed={0.5}
      maxDistance={20}
      minDistance={5}
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

const changePieceColor = (piece, color) => {
  piece.traverse((child) => {
    if (child.isMesh && child.material) {
      const newMaterial = child.material.clone();
      newMaterial.color.setHex(color);
      child.material = newMaterial;
    }
  });
};

const loadModel = (color, pieceName, pieceNumber, rotation = 0) => {
  const path = {
    r: "./pieces/rook_2.glb",
    n: "./pieces/knight_2.glb",
    b: "./pieces/bishop_2.glb",
    q: "./pieces/queen_2.glb",
    k: "./pieces/king_2.glb",
    p: "./pieces/pawn_2.glb",
  };

  return new Promise((resolve) => {
    const loader = new GLTFLoader();
    loader.load(path[pieceName], (gltf) => {
      console.log("Loaded piece", pieceName);
      const piece = gltf.scene;
      // Check if the piece is a queen and set a different scale
      if (pieceName === "q" || pieceName === "k") {
        piece.scale.set(1.5, 1.5, 1.5);
      } else if (pieceName === "p") {
        piece.scale.set(1, 0.8, 1);
      } else if (pieceName === "n" || pieceName === "b" || pieceName === "r") {
        piece.scale.set(1.2, 1.2, 1.2);
      } else {
        piece.scale.set(15, 15, 15);
      }
      piece.rotation.set(0, rotation, 0);

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

  const DisplayLights = () => (
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

  useEffect(() => {
    // // Skip the initial render
    // if (!isMounted.current) {
    //   isMounted.current = true;
    //   return;
    // }

    setGame(new Chess(true));
    loadPieces().then((loadedPieces) => {
      setPieces(loadedPieces);
    });
  }, []);

  // Check if the pieces array is full
  useEffect(() => {
    if (pieces) {
      updatePiecePosition(pieces, game.board.canonicalPosition(), undefined);
    }
  }, [pieces]);

  // Render the loading state
  if (!pieces) {
    return (
      console.log("loading"),
      (
        <div>
          <h1>Loading...</h1>
        </div>
      )
    );
  }

  // Render the component once pieces are loaded
  return (
    console.log("render"),
    (
      <div className="ChessGL">
        <Canvas camera={{ position: [-0.5, 4, -10] }}>
          <DisplayChessGame game={game} pieces={pieces} />
          <CameraControls />
          <DisplayLights />
        </Canvas>
      </div>
    )
  );
};

export default ChessGL;
