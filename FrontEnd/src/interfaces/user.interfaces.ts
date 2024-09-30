export interface LoginData {
  //id: number;
  username: string;
  password: string;
}

export interface RegisterData {
  id: number;
  name: string;
  email: string;
  password: string;
  image: string;
  createdAt: string;
}

export interface ChildrenType {
  children: React.ReactNode;
}

export interface UsersAndRooms {
  id: number;
  name: string;
  email: string;
  password: string;
  image: string;
  members: number[];
  createdAt: string;
  creator: number;
}
