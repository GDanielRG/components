export interface PaginationLink {
    label: string;
    url: string | null;
    active: boolean;
}

export interface PaginatedData<T> {
    data: T[];
    next_page_url: string | null;
    prev_page_url: string | null;
    links: PaginationLink[];
    total: number;
    from: number;
    to: number;
    summary: string;
}
