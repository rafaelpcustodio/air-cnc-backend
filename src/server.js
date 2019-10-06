const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const socketio = require('socket.io'); //escuta protocolo websocket (síncrono).servidor escuta tambem protocolo websocket
const http = require('http'); // escuta protocolo http (assíncrono)

const routes = require('./routes');

const app = express();
const server = http.Server(app); //servidor http sendo extraido do meu express
const io = socketio(server); // servidor io sendo extraido do meu server. aqui ele tambem ouve websocket

const connectedUsers = {}; //reddis para armazenar sockets simples


mongoose.connect('mongodb+srv://omnistack:omnistack@omnistack-ucdcn.mongodb.net/test?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

// ouvindo info de todo usuario que logar. Socket é a conexão com o usuario. Sempre saberá usuarios logados.
io.on('connection', socket => {
    const { user_id } = socket.handshake.query;

    connectedUsers[user_id] = socket.id;
});

app.use((req, res, next) => {
    req.io = io; // vou usar para enviar ou receber msgs do front-end.
    req.connectedUsers = connectedUsers; // todas minhas rotas tem acesso ao io
    return next();
});
app.use(cors());
app.use(express.json());
app.use('/files', express.static(path.resolve(__dirname, '..', 'uploads')));
app.use(routes);

server.listen(3333);