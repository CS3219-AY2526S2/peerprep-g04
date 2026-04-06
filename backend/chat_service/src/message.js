class RoomInfo {
    constructor() {
        this.messages = [];
        this.numPeople = 0;
    }

    isEmpty() {
        return this.numPeople == 0;
    }

    addUser() {
        this.numPeople++;
    }

    removeUser() {
        this.numPeople--;
    }

    addMessage(username, message) {
        this.messages.push({ username, message });
    }

    getAllMessages() {
        return this.messages;
    }
}

const usernameToRoomId = new Map();
const roomIdToRoomInfo = new Map();

export function joinRoom(username, roomId, socket) {
    const prevRoom = usernameToRoomId.get(username) ;
    if (prevRoom) { 
        socket.leave(roomId);
        roomIdToRoomInfo(prevRoom)?.removeUser();   
    }
    usernameToRoomId.set(username, roomId);
    socket.join(roomId);
    initialConnect(roomId, socket);
}

export function initialConnect(roomId, socket) {
    if (!roomIdToRoomInfo.has(roomId)) {
        roomIdToRoomInfo.set(roomId, new RoomInfo());
    }
    const msgs = roomIdToRoomInfo.get(roomId).getAllMessages();
    socket.emit('join room', msgs);
}

export function newMessage(username, message, io) {
    const roomId = usernameToRoomId.get(username);
    if (!roomId) return;
    const roomInfo = roomIdToRoomInfo.get(roomId);
    roomInfo.addMessage(username, message);
    io.to(roomId).emit('new message', { username, message });
}

export function leave(username, socket) {
    const roomId = usernameToRoomId.get(username);
    if (!roomId) return;
    socket.leave(roomId);
    usernameToRoomId.delete(username);
    const roomInfo = roomIdToRoomInfo(roomId);
    if (!roomInfo) return;
    roomInfo.removeUser();
    if (roomInfo.isEmpty()) roomIdToRoomInfo.delete(roomId);
}

export function resetServer() {
    usernameToRoomId.clear();
    roomIdToRoomInfo.clear();
}