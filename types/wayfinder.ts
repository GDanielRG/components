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

export type RouteByMethodFn<TMethod extends Method> = {
    (options?: RouteQueryOptions): RouteDefinition<TMethod>;
    url: (options?: RouteQueryOptions) => string;
    form: (options?: RouteQueryOptions) => RouteFormDefinition<TMethod>;
};

export type RouteFn = {
    (options?: RouteQueryOptions): RouteDefinition<'get'>;
    url: (options?: RouteQueryOptions) => string;
    form: (options?: RouteQueryOptions) => RouteFormDefinition<'get'>;
};

export type RouteMutationFn = RouteByMethodFn<'post'>;
