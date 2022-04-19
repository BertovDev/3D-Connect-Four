import './App.css';
import React, { Suspense, useEffect, useRef, useState } from "react"
import { Canvas, useFrame, useLoader } from "@react-three/fiber"
import { useGLTF, Sphere, OrbitControls, ContactShadows, Plane, Html, Environment, Loader } from '@react-three/drei'
import { TextureLoader } from 'three/src/loaders/TextureLoader'


function CreateArray({ row, col, initialX, initialY, material, opacity, geometry }) {
  let matrix = [];
  let nextPosX = initialX
  let nextPosY = initialY

  for (let i = 0; i < row; i++) {
    matrix[i] = [];
    nextPosX = initialX
    if (i !== 0) {
      nextPosY = nextPosY - 10
    }
    for (let j = 0; j < col; j++) {
      if (j !== 0) {
        nextPosX = nextPosX + 13.8
      }
      matrix[i][j] = (
        <mesh geometry={geometry} material={material} position={[nextPosX, nextPosY, 0]} rotation={[1.55, 0, 0]} >
        </mesh>
      )
    }
  }


  return (
    <group>
      {matrix.map(function (e) {
        return e;
      })}
    </group>
  )

}

function Game({ ...props }) {
  const group = useRef()
  const fichasGroup = useRef()
  const [pick, setPick] = useState(-1)
  const [turn, setTurn] = useState("red")
  const [game, setGame] = useState({ playing: true, winner: "" });
  const { nodes, materials } = useGLTF('/Scene.gltf')


  function changeTurns(currentY) {
    let auxTurn = "red"

    if (turn === "red") auxTurn = "green";
    if (turn === "green") auxTurn = "red";

    return auxTurn;
  }

  function createFicha(newPick) {
    setPick(newPick)
    let x = fichasGroup.current.children[pick].position.x;
    let currentY = -58;

    for (let i = 0; i < 42; i++) {
      if (fichasGroup.current.children[7].children[i].position.x === x) {
        if (fichasGroup.current.children[7].children[i].position.y === currentY) {
          if (fichasGroup.current.children[7].children[i].material === "white") {
            if (changeTurns() === "green") {
              fichasGroup.current.children[7].children[i].material = materials.red_ficha;
            } else {
              fichasGroup.current.children[7].children[i].material = materials['blue-ficha'];
            }
          } else {
            currentY = currentY + 10;
            i = -1;
          }
        }
      }
    }
  }


  function checkLine(a, b, c, d) {
    return ((a.material !== "white") && (a.material === b.material) && (a.material === c.material) && (a.material === d.material));
  }

  function checkWinner() {
    let winner = "";
    let auxArray = listToMatrix(fichasGroup.current.children[7].children, 7);
    let row, col;


    for (row = 0; row < 3; row++) {
      for (col = 0; col < 7; col++) {
        // VERTICAL
        if (checkLine(auxArray[row][col], auxArray[row + 1][col], auxArray[row + 2][col], auxArray[row + 3][col])) {
          winner = auxArray[row][col].material.name;
        }
      }
    }

    for (row = 0; row < 6; row++) {
      for (col = 0; col < 4; col++) {
        // HORIZONTAL
        if (checkLine(auxArray[row][col], auxArray[row][col + 1], auxArray[row][col + 2], auxArray[row][col + 3])) {
          winner = auxArray[row][col].material.name;
        }
      }
    }

    for (row = 0; row < 3; row++) {
      for (col = 0; col < 4; col++) {
        //DOWN-RIGHT
        if (checkLine(auxArray[row][col], auxArray[row + 1][col + 1], auxArray[row + 2][col + 2], auxArray[row + 3][col + 3])) {
          winner = auxArray[row][col].material.name;
        }
      }
    }

    for (row = 3; row < 6; row++) {
      for (col = 0; col < 4; col++) {
        //DOWN-RIGHT
        if (checkLine(auxArray[row][col], auxArray[row - 1][col + 1], auxArray[row - 2][col + 2], auxArray[row - 3][col + 3])) {
          winner = auxArray[row][col].material.name;
        }
      }
    }

    return winner;
  }

  function listToMatrix(list, elementsPerSubArray) {
    let matrix = [], i, k;

    for (i = 0, k = -1; i < list.length; i++) {
      if (i % elementsPerSubArray === 0) {
        k++;
        matrix[k] = [];
      }
      matrix[k].push(list[i]);
    }
    return matrix;
  }


  useFrame(() => {



    //CHECK CONNECTIONS
    let winner = checkWinner();

    if (winner !== "") {
      if (winner === "red_ficha") {
        winner = "red"
      } else {
        winner = "green"
      }
      setGame({ playing: false, winner: winner });
      const gameOverText = document.getElementsByClassName("game_over");
      // const turnText = document.getElementsByClassName("turns");
      // turnText[0].style.display = "none"
      gameOverText[0].style.display = "initial";
      gameOverText[1].style.display = "initial";
    }



    if (game.playing) {
      if (turn === "red") {
        for (let i = 0; i < fichasGroup.current.children.length; i++) {
          fichasGroup.current.children[i].material = materials.red_ficha;
        }
      }
      if (turn === "green") {
        for (let i = 0; i < fichasGroup.current.children.length; i++) {
          fichasGroup.current.children[i].material = materials['blue-ficha']
        }
      }
    } else {
      setTurn("");
    }

  })

  return (
    <>
      <Html fullscreen>
        <div className=' font-mono flex flex-col w-96 h-96 font-bold mt-96 ml-40 text-black'>
          <div className='text-center m-5 '><h1 className='text-6xl'>Turn:{turn}</h1></div>
          <div className='text-center m-5 text-red-800'> <h1 className='text-6xl text-center game_over'>GAME OVER</h1></div>
          <div className='text-center m-5'><h1 className='text-6xl text-center game_over'>{game.winner} Wins</h1></div>
        </div>
      </Html>

      <group ref={group} {...props} dispose={null}>
        <mesh geometry={nodes.FourInARowV2.geometry} material={materials['Material.001']}>
          <meshStandardMaterial color="#1300a1" />
        </mesh>

        <mesh geometry={nodes['4_connect_disc'].geometry} material={materials.red_ficha} position={[10.95, -5, 0]} />
        <mesh geometry={nodes['4_connect_disc001'].geometry} material={materials['blue-ficha']} position={[-14.78, -5, 0]} />

        <group ref={fichasGroup} >
          <mesh geometry={nodes['4_connect_disc'].geometry} position={[38.1, 4, 0]} rotation={[1.55, 0, 0]} onClick={() => { if (game.playing) { setTurn(changeTurns()); createFicha(0) } }} onPointerOver={() => setPick(0)}>
            <meshDepthMaterial opacity={0.15} color="grey" />
          </mesh>
          <mesh geometry={nodes['4_connect_disc001'].geometry} position={[24.3, 4, 0]} rotation={[1.55, 0, 0]} onClick={() => { if (game.playing) { setTurn(changeTurns()); createFicha(1) } }} onPointerOver={() => setPick(1)}>
            <meshDepthMaterial opacity={0.15} color="grey" />
          </mesh>
          <mesh geometry={nodes['4_connect_disc'].geometry} position={[10.5, 4, 0]} rotation={[1.55, 0, 0]} onClick={() => { if (game.playing) { setTurn(changeTurns()); createFicha(2) } }} onPointerOver={() => setPick(2)}>
            <meshDepthMaterial opacity={0.15} color="grey" />
          </mesh>
          <mesh geometry={nodes['4_connect_disc001'].geometry} position={[-3.3000000000000007, 4, 0]} rotation={[1.55, 0, 0]} onClick={() => { if (game.playing) { setTurn(changeTurns()); createFicha(3) } }} onPointerOver={() => setPick(3)}>
            <meshDepthMaterial opacity={0.15} color="grey" />
          </mesh>
          <mesh geometry={nodes['4_connect_disc'].geometry} position={[-17.1, 4, 0]} rotation={[1.55, 0, 0]} onClick={() => { if (game.playing) { setTurn(changeTurns()); createFicha(4) } }} onPointerOver={() => setPick(4)}>
            <meshDepthMaterial opacity={0.15} color="grey" />
          </mesh>
          <mesh geometry={nodes['4_connect_disc001'].geometry} position={[-30.900000000000002, 4, 0]} rotation={[1.55, 0, 0]} onClick={() => { if (game.playing) { setTurn(changeTurns()); createFicha(5) } }} onPointerOver={() => setPick(5)}>
            <meshDepthMaterial opacity={0.15} color="grey" />
          </mesh>
          <mesh geometry={nodes['4_connect_disc001'].geometry} position={[-44.7, 4, 0]} rotation={[1.55, 0, 0]} onClick={() => { if (game.playing) { setTurn(changeTurns()); createFicha(6) } }} onPointerOver={() => setPick(6)}>
            <meshDepthMaterial opacity={0.15} color="grey" />
          </mesh>
          <CreateArray row={6} col={7} initialX={-44.7} initialY={-8} geometry={nodes['4_connect_disc'].geometry} material="white" opacity={0} />

        </group>
      </group>
    </>
  )
}


useGLTF.preload('/Scene.gltf')


function App() {

  const colorMap = useLoader(TextureLoader, "wood.jpg");

  return (
    <>
      <Canvas shadows dpr={[1, 2]} camera={{ position: [0.1, 2, 10], fov: 35, }}>
        {/* <ambientLight /> */}
        <Suspense fallback={null}>
          <Game scale={0.04} position={[0, -0.5, 0]} rotation={[0, 9.43, 0]} />
          <Plane rotation={[-1.5, 0, 0]} position={[0, -0.5, 0]} scale={20}>
            <meshStandardMaterial map={colorMap} />
          </Plane>
          <OrbitControls enableZoom={false} maxPolarAngle={Math.PI / 2.1} />
          <Html fullscreen>
            <div className='container  w-32 h-72 flex flex-col text-center mt-80 ml-72'>
              <button className=' bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 border-b-4 border-blue-700 hover:border-blue-500 rounded"' onClick={() => document.location.reload(true)}>PLAY AGAIN</button>
            </div>
            <div className='flex flex-row w-screen mt-64 h-12 font-mono font-bold justify-end'>
              <h1 className='text-2xl p-5'>By TongenJs</h1>
              <a className='pt-4 pr-2 w-12'  href="https://www.linkedin.com/in/bautista-berto/" target="_blank"><img src="linkedin.png" alt="" /></a>
              <a className='pt-4 pr-2 w-12'  href="https://twitter.com/tongenjs" target="_blank"><img src="twitter.png" alt="" /></a>
            </div>
          </Html>
        </Suspense>
        <Environment files="studio.hdr" background />
      </Canvas>
      <Loader
        dataInterpolation={(p) => `Loading ${p.toFixed(2)}%`}
        dataStyles={{ "fontSize": "2 rem", }}
      />
    </>
  );
}

export default App;
