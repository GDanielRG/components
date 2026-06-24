// Narrow structural contract for a comment. The consumer's richer domain
// `Comment` (an Eloquent resource) is assignable to this — the shared
// components only read the fields below. Authorship is read from a uniform
// `author` shape when present, falling back to the legacy `employee.user`
// relation, so Employee-authored and User-authored comment surfaces can share
// one component without forking it per repo.
export interface Comment {
    id: number;
    content: string;
    can_be_managed?: boolean;
    formatted_created_at?: string | null;
    formatted_created_at_diff?: string | null;
    formatted_updated_at?: string | null;
    formatted_updated_at_diff?: string | null;
    /** Uniform author shape (Employee- or User-authored). Preferred when present. */
    author?: {
        name?: string | null;
        avatar?: string | null;
    } | null;
    /** Legacy Employee-relation author shape; read as a fallback to `author`. */
    employee?: {
        user?: {
            name?: string | null;
        } | null;
    } | null;
}
