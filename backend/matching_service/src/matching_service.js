import { Mutex } from "async-mutex";
import { get_question, get_req_intersection, has_req_intersection } from "./utils.js";

export const states = Object.freeze({
    invalid: 'invalid',
    register: 'register',
    matching: 'matching',
    matched: 'matched',
});

class State {
    constructor() {
        this.state = states.invalid;
    }
}

class RegisterState extends State {
    constructor() {
        super();
        this.state = states.register;
    }
}

class MatchingState extends State {
    constructor() {
        super();
        this.state = states.matching;
    }
}

class MatchedState extends State {
    constructor(users, question) {
        super();
        this.state = states.matched;
        this.users = users;
        this.question = question;
        this.users_in = 2;
        this.room_id = 0;
    }
}

class MatchingQueueData {
    constructor(username, req) {
        this.username = username;
        this.req = req;
    }
}

export class MatchingService {
    constructor() {
        this.username_to_state = new Map();
        this.matching_queue = [];
        this.mutex = new Mutex();
    }

    async register(username) {
        await this.mutex.acquire();
        
        let state = this.username_to_state.get(username);
        if (!state) {
            state = new RegisterState();
            this.username_to_state.set(username, state);
        }
        
        this.mutex.release();
        
        return state;
    }

    async request_match(username, req) {
        await this.mutex.acquire();
        
        let state = this.username_to_state.get(username);
        if (state && (state.state === states.matching || state.state === states.matched)) {
            this.mutex.release();
            return state;
        }

        const idx = this.matching_queue.findIndex(data => has_req_intersection(req, data.req));
        if (idx === -1) {
            this.matching_queue.push(new MatchingQueueData(username, req));
            state = new MatchingState();
            this.username_to_state.set(username, state);
            this.mutex.release();
            return state;
        } else {
            const user2_data = this.matching_queue[idx];
            this.matching_queue.splice(idx, 1);
            const question = await get_question(get_req_intersection(req, user2_data.req));
            state = new MatchedState([username, user2_data.username], question);
            this.username_to_state.set(username, state);
            this.username_to_state.set(user2_data.username, state);
            this.mutex.release();
            return state;
        }
    }

    
    async leave(username) {
        await this.mutex.acquire();
        
        const state = this.username_to_state.get(username);
        
        if (!state) {
            // nothing
        } else if (state.state === states.matching) {
            const idx = this.matching_queue.findIndex(data => data.username === username);
            if (idx !== -1) {
                this.matching_queue.splice(idx, 1);
            }    
        } else if (state.state === states.matched) {
            state.users_in--;
        }
       
        this.username_to_state.delete(username);
        
        this.mutex.release();
        return state;
    }

    // if diconnected and user is matched (i.e in a room),
    // save the state so user can reconnect back.
    // if in register or matching, just remove the state, user repeat matching process.
    async disconnect(username) {
        await this.mutex.acquire();

        const state = this.username_to_state.get(username);
        if (!state) {
            // nothing
        } else if (state.state === states.register) {
            this.username_to_state.delete(username);
        } else if (state.state === states.matching) {
            const idx = this.matching_queue.findIndex(data => data.username === username);
            if (idx !== -1) {
                this.matching_queue.splice(idx, 1);
            }
            this.username_to_state.delete(username);
        } 
        
        this.mutex.release();
        return state;
    }
}
