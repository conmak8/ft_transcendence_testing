// src/stores/roomStore.ts
import { navigateTo } from './router';

export interface Room
{
    id: string;
    name: string;
    currentPlayers: number;
    maxPlayers: number;
    entryFee: number;
};

// export const roomState = $state({
//     rooms: [],
//     isConnected: false,
//     currentRoomId: null as string | null
// });

// Define the interface for your state
export interface RoomState
{
    rooms: Room[];
    isConnected: boolean;
    currentRoomId: string | null;
}

//new one
const initialRoomState: RoomState = {
    rooms: [],
    isConnected: false,
    currentRoomId: null
};

// Export the state directly
// export const roomState = $state<RoomState>(initialRoomState);


// Use the interface as a type for $state
export const roomState = $state<RoomState>({
    rooms: [],
    isConnected: false,
    currentRoomId: null
});

let socket: WebSocket | null = null;

export function connect(token: string)
{
    if (socket) return; // Prevent multiple connections

    socket = new WebSocket('ws://localhost:8080/ws');

    socket.onopen = () => {
        console.log("WebSocket connected");
        roomState.isConnected = true;
        send('auth', { token });
    };

    socket.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        const { event: type, data } = msg;

        switch (type) {
            case 'room:list':
                roomState.rooms = data;
                break;
                
            case 'room:create':
                // Add the new room to the list
                roomState.rooms = [data, ...roomState.rooms];
                break;

            case 'room:update':
                // Update players count or status in real-time
                const idx = roomState.rooms.findIndex(r => r.id === data.id);
                if (idx !== -1) roomState.rooms[idx] = data;
                break;

            case 'room:joined':
                // SERVER CONFIRMED JOIN: Now we navigate
                roomState.currentRoomId = data.room_id;
                navigateTo('/game');
                break;

            case 'error':
                console.error("Server error event:", data);
                // alert(`Server Error: ${data.message}`);
                    alert(`Server Error: ${data?.message || "Unknown error"}`);
                break;
        }
    };

    socket.onclose = () => {
        console.log("WebSocket closed");
        roomState.isConnected = false;
        socket = null;
    };
}

export function send(event: string, data: any)
{
    //  console.log("Sending to WS:", { event, data });
    if (socket?.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ event, data }));
    } 
    else
    {
        console.error("WebSocket is not connected.Event:", event, "Data:", data);
    }
}