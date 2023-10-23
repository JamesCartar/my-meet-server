const express = require('express');
const socketIo = require('socket.io');
const http = require('http');
const cors = require('cors');
const admin = require("firebase-admin");

require('dotenv').config();

const roomRouter = require('./routes/room.js');

const connectDB = require('./config/connectDB.js');
const serviceAccount = require("./config/google-services.json");
const eventEmitter = require('./utils/eventEmitter.js');

const app = express();

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://meet-1fa4e-default-rtdb.asia-southeast1.firebasedatabase.app"
});

app.use(cors({
    origin: ["https://my-meet-v1.vercel.app", "http://localhost:3000"],
    credentials: true
}));

app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true}));


app.get('/', (req, res) => {
    res.status(200).json({success: true, message: 'Welcome from meet server :)'})
});

app.use('/rooms', roomRouter);





const httpServer = http.createServer(app);
// const io = socketIo(httpServer, {
//     cors: {
//         origin: ["https://my-meet-v1.vercel.app", "http://localhost:3000"]
//     }
// });

const io = socketIo(httpServer, {
    cors: {
      origin: ["https://my-meet-v1.vercel.app", "http://localhost:3000"],
      credentials: true
    }
  });


// Set up a connection event handler for socket.io
io.on('connection', (socket) => {

    

    socket.on('room:create', ({ user, roomId}) => {
        // console.log( user.name +  ' created this room ' + roomId);
        socket.join(roomId);
    });


    socket.on('room:join', ({ user, roomId }) => {
        // console.log( user.name + ' join this room ' + roomId);
        socket.join(roomId);
        io.to(roomId).emit("room:join", user)
    });

    socket.on('user:call', ({ to, offer }) => {
        // admin send the first offer to user
        io.to(to.socketId).emit('incomming:call', { from: socket.id, offer });
    })

    socket.on('call:accepted', ({ to, ans }) => {
        // sending to admin that user has accepted and sending the user's ans
        io.to(to).emit('call:accepted', { from: socket.id, ans });
    });

    socket.on('peer:nego:needed', ({ to, offer }) => {
        socket.broadcast.to(to).emit("peer:nego:needed", { from: to, offer })
        // io.to(to.socketId).emit("peer:nego:needed", { from: socket.id, offer });
    })

    socket.on('peer:nego:done', ({ to, ans }) => {
        socket.broadcast.to(to).emit("peer:nego:final", { from: socket.id, ans })
        // io.to(to).emit("peer:nego:final", { from: socket.id, ans });
    })

    socket.on('ice-candidate', ({ to, candidate }) => {
        // Send the received ICE candidate to the target peer
        io.to(to.socketId).emit('ice-candidate', { from: socket.id, candidate });
    });


    // eventEmitter.on('room:join', ({ userId, roomId }) => {
    //     socket.join(roomId);
    //     console.log('room to send: ', roomId)
    //     io.to(roomId).emit("room:join", userId)
    // });



});






const start = async () => {
    try {
        connectDB(process.env.MONGO_URI);
        httpServer.listen(3500, () => {
            console.log('Server is listening on port http://localhost:3500');
        });
    } catch (error) {
        console.log(error);
    }
}

start();
