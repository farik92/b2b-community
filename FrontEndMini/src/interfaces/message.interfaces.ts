import { RegisterData } from "./user.interfaces";

export interface Message {
  message_ID?: number;
  sender: RegisterData;
  content: string;
  createdAt: string;
  type: string;
  receiverId: number;
  isRead: boolean;
  source: string;
}

export interface SenderStringMessage {
  message_ID?: number;
  sender: number;
  content: string;
  createdAt: string;
  type: string;
  receiverId: number;
  isRead: boolean;
  source: string;
}
