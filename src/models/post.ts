export interface Posts {
    id: number;
    user_id: number;
    caption: string;
    timestamp: Date;
    media: Media[];
    user: {
        id: number;
        username: string;
        avatar: string | null;
    };
    _count: {
        likes: number;
        comments: number;
    };
    isLiked?: boolean
}

interface Media {
    id: number;
    post_id: number;
    link_url: string;
    timestamp: Date;
}

export interface Pagination {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}

export interface PostResponse {
    posts: Posts[];
    pagination: Pagination;
}