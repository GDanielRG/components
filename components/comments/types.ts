export interface Comment {
    id: number;
    content: string;
    can_be_managed?: boolean;
    is_current_user?: boolean;
    formatted_created_at?: string | null;
    formatted_created_at_diff?: string | null;
    formatted_updated_at?: string | null;
    formatted_updated_at_diff?: string | null;
    author?: {
        name?: string | null;
        avatar?: string | null;
    } | null;
}
