// Narrow structural contract for a comment. The consumer's richer domain
// `Comment` (an Eloquent resource) is assignable to this — the shared
// components only read the fields below. Authorship is read from a uniform
// `author` shape, so Employee-authored and User-authored comment surfaces can
// share one component without forking it per repo.
export interface Comment {
    id: number;
    content: string;
    can_be_managed?: boolean;
    is_current_user?: boolean;
    formatted_created_at?: string | null;
    formatted_created_at_diff?: string | null;
    formatted_updated_at?: string | null;
    formatted_updated_at_diff?: string | null;
    /** Uniform author shape for Employee- or User-authored comments. */
    author?: {
        name?: string | null;
        avatar?: string | null;
    } | null;
}
