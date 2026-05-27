export interface User {
  id: string;
  username: string;
  interests: string[];
}

export interface Reaction {
  emoji: string;
  count: number;
  users: string[];
}

export interface Message {
  senderId: string;
  message: string;
  timestamp: string;
  id?: string;
  reactions?: Reaction[];
}

export interface MatchInfo {
  roomId: string;
  peerId: string;
  peerSocketId: string;
}
