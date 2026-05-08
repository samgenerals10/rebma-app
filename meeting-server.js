import { Server } from 'socket.io'
import { createServer } from 'http'

const httpServer = createServer()
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
})

interface Room {
  id: string
  hostId: string
  participants: Map<string, { id: string; name: string; mic: boolean; video: boolean }>
  createdAt: Date
}

const rooms = new Map<string, Room>()

io.on('connection', (socket) => {
  console.log('User connected:', socket.id)

  socket.on('join-room', ({ roomId, userName }) => {
    socket.join(roomId)
    
    let room = rooms.get(roomId)
    if (!room) {
      room = {
        id: roomId,
        hostId: socket.id,
        participants: new Map(),
        createdAt: new Date()
      }
      rooms.set(roomId, room)
    }

    room.participants.set(socket.id, {
      id: socket.id,
      name: userName || `User ${socket.id.slice(0, 4)}`,
      mic: true,
      video: true
    })

    socket.to(roomId).emit('user-joined', {
      userId: socket.id,
      userName: userName
    })

    const participants = Array.from(room.participants.values())
    socket.emit('room-users', { participants })

    console.log(`User ${userName} joined room ${roomId}`)
  })

  socket.on('offer', ({ to, offer }) => {
    socket.to(to).emit('offer', { from: socket.id, offer })
  })

  socket.on('answer', ({ to, answer }) => {
    socket.to(to).emit('answer', { from: socket.id, answer })
  })

  socket.on('ice-candidate', ({ to, candidate }) => {
    socket.to(to).emit('ice-candidate', { from: socket.id, candidate })
  })

  socket.on('toggle-mic', ({ roomId, enabled }) => {
    const room = rooms.get(roomId)
    if (room) {
      const participant = room.participants.get(socket.id)
      if (participant) {
        participant.mic = enabled
        socket.to(roomId).emit('user-mic-toggled', { userId: socket.id, enabled })
      }
    }
  })

  socket.on('toggle-video', ({ roomId, enabled }) => {
    const room = rooms.get(roomId)
    if (room) {
      const participant = room.participants.get(socket.id)
      if (participant) {
        participant.video = enabled
        socket.to(roomId).emit('user-video-toggled', { userId: socket.id, enabled })
      }
    }
  })

  socket.on('remove-participant', ({ roomId, participantId }) => {
    const room = rooms.get(roomId)
    if (room && room.hostId === socket.id) {
      io.to(participantId).emit('removed-from-room')
      socket.to(roomId).emit('participant-removed', { participantId })
    }
  })

  socket.on('leave-room', ({ roomId }) => {
    handleLeaveRoom(socket, roomId)
  })

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id)
    rooms.forEach((room, roomId) => {
      handleLeaveRoom(socket, roomId)
    })
  })

  function handleLeaveRoom(socket: any, roomId: string) {
    const room = rooms.get(roomId)
    if (room) {
      room.participants.delete(socket.id)
      socket.to(roomId).emit('user-left', { userId: socket.id })
      socket.leave(roomId)

      if (room.participants.size === 0) {
        rooms.delete(roomId)
      } else if (room.hostId === socket.id) {
        const newHost = room.participants.keys().next().value
        if (newHost) {
          room.hostId = newHost
          io.to(roomId).emit('host-changed', { newHost })
        }
      }
    }
  }
})

  socket.on('start-screen-share', ({ roomId }) => {
    socket.to(roomId).emit('screen-share-started', { userId: socket.id })
  })

  socket.on('stop-screen-share', ({ roomId }) => {
    socket.to(roomId).emit('screen-share-stopped', { userId: socket.id })
  })
})

const PORT = process.env.MEETING_PORT || 3002

httpServer.listen(PORT, () => {
  console.log(`Meeting server running on port ${PORT}`)
})

export default httpServer