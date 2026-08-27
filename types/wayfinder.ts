// Inline structural route types keep registry installs independent of generated app output.

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

/** Callable-only route seam; use RouteMutationFn only when a consumer reads `.form()`. */
export type RouteResolver<TMethod extends Method> = (
    options?: RouteQueryOptions,
) => RouteDefinition<TMethod>;

export type RouteByMethodFn<TMethod extends Method> = {
    (options?: RouteQueryOptions): RouteDefinition<TMethod>;
    url: (options?: RouteQueryOptions) => string;
    form: (options?: RouteQueryOptions) => RouteFormDefinition<TMethod>;
};

export type RouteMutationFn = RouteByMethodFn<'post'>;
