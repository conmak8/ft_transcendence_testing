// const API_URL = 'http://localhost:8080/api/v1';

// export interface Room
// {
//     id: string;
//     name: string;
//     currentPlayers: number;
//     maxPlayers: number;
//     entryFee: number;
// };

// const initialState: Room = 
// {
//     id: '',
//     name: '',
//     currentPlayers: 0,
//     maxPlayers: 0,
//     entryFee: 0
// };

// export type UpdateRoomsPayload = 
// {
//     currentPlayers?: number;
//     maxPlayers?: number;
// };

// export async function createRoom(roomData: {name: string; entryFee: number; maxPlayers: number}): Promise<Room[]>
// {
//     const response = await fetch (`${API_URL}/backend endpoint`,{
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/jason',
//         },
//         body: JSON.stringify(roomData),
//     });
//     if(!response.ok)
//     {
//         throw new Error('Failed to create room');
//     }
//     return await response.json();
// }


// 1. Move the list to a variable so we can modify it
// let mockRooms: Room[] = [];

// // 2. Fetch the current list (simulating a network delay)
// export async function getAllRooms(): Promise<Room[]> {
//     return new Promise((resolve) => {
//         setTimeout(() => resolve([...mockRooms]), 300); 
//     });
// }

// // 3. Mock the POST request
// export async function createRoom(roomData: { name: string; entryFee: number; maxPlayers: number }): Promise<Room> {
//     return new Promise((resolve) => {
//         const newRoom: Room = {
//             ...roomData,
//             id: Math.random().toString(36).substr(2, 9), // Generate a random ID
//             currentPlayers: 0 // New rooms start empty
//         };

//         console.log("Mock API: Creating room...", newRoom);
        
//         // Push to our local "database"
//         mockRooms = [newRoom, ...mockRooms]; 

//         setTimeout(() => resolve(newRoom), 500);
//     });
// }


// export async function joinRoom(roomId: string): Promise<boolean>
// {
//     console.log(`Mock API: Attempting to join room ${roomId}...`);
//     return new Promise((resolve) => {
//         setTimeout(() => {
//             console.log(`Successfully joined room ${roomId}`);
//             resolve(true);
//         }, 300);
//     });
// }