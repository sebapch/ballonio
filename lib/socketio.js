import { io } from 'socket.io-client'

let socket

export const initSocket = () => {
  socket = io()
  return socket
}

export const getSocket = () => {
  if (!socket) {
    throw new Error('Socket not initialized')
  }
  return socket
}