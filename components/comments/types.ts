// Narrow structural contract for a comment. The consumer's richer domain
// `Comment` (an Eloquent resource, with a full `employee` relation) is
// assignable to this — the shared components only read the fields below.
export interface Comment {
    id: number;
    content: string;
    can_be_managed?: boolean;
    formatted_created_at?: string | null;
    formatted_created_at_diff?: string | null;
    formatted_updated_at?: string | null;
    formatted_updated_at_diff?: string | null;
    employee?: {
        user?: {
            name?: string | null;
        } | null;
    } | null;
}
