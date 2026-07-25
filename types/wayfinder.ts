// Structural route types compatible with Laravel Wayfinder's generated output.
// Defined inline (rather than re-exported from the app-owned `@/wayfinder`
// barrel) so the registry does not require Wayfinder generation to install.

type Method = 'get' | 'post' | 'put' | 'delete' | 'patch' | 'head' | 'options';

export type QueryParams = {
    [key: string]:
        | string
        | number
        | boolean
        | (string | number)[]
        | null
        | undefined
        | QueryParams;
};

export type RouteDefinition<
    TMethod extends Method | Method[],
    TComponent extends string | Record<string, string> | undefined = undefined,
> = {
    url: string;
    component?: TComponent;
} & (TMethod extends Method[] ? { methods: TMethod } : { method: TMethod });

export type RouteFormDefinition<
    TMethod extends Method,
    TComponent extends string | Record<string, string> | undefined = undefined,
> = {
    action: string;
    method: TMethod;
    component?: TComponent;
};

export type RouteQueryOptions = {
    query?: QueryParams;
    mergeQuery?: QueryParams;
};

/**
 * A route narrowed to the only thing most consumers do with it: CALL it.
 *
 * Wayfinder's generated route objects satisfy this structurally, and so does a
 * bare arrow that pre-binds arguments — which is what lets a caller pass
 * `(options) => CompanyController.show({ company: slug }, options)` instead of
 * building an `Object.assign` carrier whose only job is to supply `.url` and
 * `.form` members nothing ever reads.
 *
 * Prefer this everywhere. Reach for {@link RouteMutationFn} only when a consumer
 * genuinely reads `.form()` — spreading it onto an Inertia `<Form>`, as
 * grupo-3t's VIN validation form does.
 */
export type RouteResolver<TMethod extends Method> = (
    options?: RouteQueryOptions,
) => RouteDefinition<TMethod>;

export type RouteByMethodFn<TMethod extends Method> = {
    (options?: RouteQueryOptions): RouteDefinition<TMethod>;
    url: (options?: RouteQueryOptions) => string;
    form: (options?: RouteQueryOptions) => RouteFormDefinition<TMethod>;
};

export type RouteMutationFn = RouteByMethodFn<'post'>;
