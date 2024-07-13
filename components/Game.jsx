import { useEffect, useState, useCallback } from 'react'
import io from 'socket.io-client'
import Player from './Player'

const GAME_WIDTH = 800
const GAME_HEIGHT = 600

export default function Game() {
  const [socket, setSocket] = useState(null)
  const [players, setPlayers] = useState({})
  const [playerId, setPlayerId] = useState(null)

  useEffect(() => {
    const newSocket = io()
    setSocket(newSocket)

    newSocket.on('connect', () => {
      console.log('Connected to server');
      setPlayerId(newSocket.id)
    })

    newSocket.on('gameState', (gameState) => {
      console.log('Received game state:', gameState);
      const playersObj = Object.fromEntries(gameState);
      setPlayers(playersObj)
    })

    newSocket.on('playerJoined', (player) => {
      console.log('Player joined:', player);
      setPlayers(prev => ({ ...prev, [player.id]: player }))
    })

    newSocket.on('playerMoved', (player) => {
      setPlayers(prev => ({
        ...prev,
        [player.id]: { ...prev[player.id], ...player }
      }))
    })

    newSocket.on('balloonPopped', ({ id, balloonIndex }) => {
      setPlayers(prev => {
        const player = prev[id];
        if (player) {
          const newBalloons = [...player.balloons];
          newBalloons[balloonIndex] = false;
          return {
            ...prev,
            [id]: { ...player, balloons: newBalloons }
          };
        }
        return prev;
      });
    });

    newSocket.on('scoreUpdated', ({ id, score }) => {
      setPlayers(prev => ({
        ...prev,
        [id]: { ...prev[id], score }
      }))
    })

    newSocket.on('playerReset', (player) => {
      setPlayers(prev => ({
        ...prev,
        [player.id]: player
      }))
    })

    newSocket.on('playerLeft', (id) => {
      console.log('Player left:', id);
      setPlayers(prev => {
        const newPlayers = { ...prev }
        delete newPlayers[id]
        return newPlayers
      })
    })

    return () => newSocket.close()
  }, [])

  const handleKeyDown = useCallback((e) => {
    if (!socket || !playerId) return

    const player = players[playerId]
    if (!player) return

    let vx = player.vx
    let vy = player.vy

    switch (e.key) {
      case ' ':
        vy = -5
        break
      case 'ArrowLeft':
        vx = -3
        break
      case 'ArrowRight':
        vx = 3
        break
    }

    socket.emit('move', { vx, vy })
  }, [socket, players, playerId])

  const handleKeyUp = useCallback((e) => {
    if (!socket || !playerId) return

    const player = players[playerId]
    if (!player) return

    let vx = player.vx

    switch (e.key) {
      case 'ArrowLeft':
      case 'ArrowRight':
        vx = 0
        break
    }

    socket.emit('move', { vx, vy: player.vy })
  }, [socket, players, playerId])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [handleKeyDown, handleKeyUp])

  return (
    <div 
      className="relative bg-sky-200 border-4 border-blue-500" 
      style={{ width: `${GAME_WIDTH}px`, height: `${GAME_HEIGHT}px` }}
    >
      {Object.entries(players).map(([id, player]) => (
        <Player 
          key={id} 
          player={player} 
          isCurrentPlayer={id === playerId} 
        />
      ))}
    </div>
  )
}