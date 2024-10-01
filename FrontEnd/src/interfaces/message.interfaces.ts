import { RegisterData } from "./user.interfaces";

export interface Message {
  message_ID?: number;
  sender: RegisterData;
  content: string;
  createdAt: string;
  type: string;
  receiverId: number;
}

export interface SenderStringMessage {
  message_ID?: number;
  sender: string;
  content: string;
  createdAt: string;
  type: string;
  receiverId: number;
}