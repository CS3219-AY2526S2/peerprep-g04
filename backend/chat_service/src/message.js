class RoomInfo {
    constructor() {
        this.messages = [];
        this.peoples = new Set();
    }

    isEmpty() {
        return this.peoples.size == 0;
    }

    addUser(username) {
        this.peoples.add(username);
    }

    removeUser(username) {
        this.peoples.delete(username);
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
        socket.leave(prevRoom);
        roomIdToRoomInfo.get(prevRoom)?.removeUser(username);   
    }
    usernameToRoomId.set(username, roomId);
    socket.join(roomId);
    initialConnect(username, roomId, socket);
}

export function initialConnect(username, roomId, socket) {
    if (!roomIdToRoomInfo.has(roomId)) {
        roomIdToRoomInfo.set(roomId, new RoomInfo());
    }
    roomIdToRoomInfo.get(roomId).addUser(username);
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
    const roomInfo = roomIdToRoomInfo.get(roomId);
    if (!roomInfo) return;
    roomInfo.removeUser(username);
    if (roomInfo.isEmpty()) roomIdToRoomInfo.delete(roomId);
}

export function resetServer() {
    usernameToRoomId.clear();
    roomIdToRoomInfo.clear();
}