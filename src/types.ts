export interface User {
  id: string;
  username: string;
  interests: string[];
}

export interface Message {
  senderId: string;
  message: string;
  timestamp: string;
}

export interface MatchInfo {
  roomId: string;
  peerId: string;
  peerSocketId: string;
}
