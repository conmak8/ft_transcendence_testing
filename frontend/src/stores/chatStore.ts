/*  
    When the room_id is null then we know that  message will broadcast tob the 'global_chat'
    When the room_id is a number then message corresponding to the room chanel   
*/

import { send } from "./roomStore.svelte";
import { roomState } from "./roomStore.svelte";

let chatInput = $state('');
let isLoading = $state(false);
let error = $state(null);


interface ChatMessage {
  id: number;
  sender: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
  room_id: number | null;
  content: string;
  created_at: string;
}

let globalMessages = $state<ChatMessage[]>([]);  // For global chat messages
let messages = $state<ChatMessage[]>([]); // For room chat messages

export function sendMessage(content: string)
{
    send('chat:send', { room_id: null, content });
}

export function loadHistory()
{

}
