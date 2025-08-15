export interface User {
    id: number;
    name: string;
    email: string;
    username: string;
    bio: string | null;
    avatar: string | null;
    following: number,
    follower: number
}

interface Following {
    id: number,
    username: string,
    avatar: string | null
}