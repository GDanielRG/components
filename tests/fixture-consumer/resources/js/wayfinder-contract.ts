// Mirrors Laravel Wayfinder's emitted declarations because registry consumers
// install the hand-maintained route types without running `wayfinder:generate`.
import type {
    QueryParams,
    RouteByMethodFn,
    RouteDefinition,
    RouteFormDefinition,
    RouteQueryOptions,
    RouteResolver,
} from '@/components/types/wayfinder';

type WayfinderMethod =
    'get' | 'post' | 'put' | 'delete' | 'patch' | 'head' | 'options';

type WayfinderQueryParams = {
    [key: string]:
        | string
        | number
        | boolean
        | (string | number)[]
        | null
        | undefined
        | WayfinderQueryParams;
};

type WayfinderRouteDefinition<
    TMethod extends WayfinderMethod | WayfinderMethod[],
    TComponent extends string | Record<string, string> | undefined = undefined,
> = {
    url: string;
    component?: TComponent;
} & (TMethod extends WayfinderMethod[]
    ? { methods: TMethod }
    : { method: TMethod });

type WayfinderRouteFormDefinition<
    TMethod extends WayfinderMethod,
    TComponent extends string | Record<string, string> | undefined = undefined,
> = {
    action: string;
    method: TMethod;
    component?: TComponent;
};

type WayfinderRouteQueryOptions = {
    query?: WayfinderQueryParams;
    mergeQuery?: WayfinderQueryParams;
};

declare const generatedIndexRoute: {
    (options?: WayfinderRouteQueryOptions): WayfinderRouteDefinition<'get'>;
    definition: WayfinderRouteDefinition<['get', 'head'], string>;
    url: (options?: WayfinderRouteQueryOptions) => string;
    get: (
        options?: WayfinderRouteQueryOptions,
    ) => WayfinderRouteDefinition<'get'>;
    head: (
        options?: WayfinderRouteQueryOptions,
    ) => WayfinderRouteDefinition<'head'>;
    form: {
        (
            options?: WayfinderRouteQueryOptions,
        ): WayfinderRouteFormDefinition<'get'>;
        get: (
            options?: WayfinderRouteQueryOptions,
        ) => WayfinderRouteFormDefinition<'get'>;
    };
};

declare const generatedStoreRoute: {
    (options?: WayfinderRouteQueryOptions): WayfinderRouteDefinition<'post'>;
    url: (options?: WayfinderRouteQueryOptions) => string;
    form: (
        options?: WayfinderRouteQueryOptions,
    ) => WayfinderRouteFormDefinition<'post'>;
};

type MutuallyAssignable<A, B> = [A] extends [B]
    ? [B] extends [A]
        ? true
        : false
    : false;

export const queryParamsMatchWayfinder: MutuallyAssignable<
    QueryParams,
    WayfinderQueryParams
> = true;

export const routeQueryOptionsMatchWayfinder: MutuallyAssignable<
    RouteQueryOptions,
    WayfinderRouteQueryOptions
> = true;

export const routeDefinitionMatchesWayfinder: MutuallyAssignable<
    RouteDefinition<'get'>,
    WayfinderRouteDefinition<'get'>
> = true;

export const multiMethodRouteDefinitionMatchesWayfinder: MutuallyAssignable<
    RouteDefinition<['get', 'head'], string>,
    WayfinderRouteDefinition<['get', 'head'], string>
> = true;

export const routeFormDefinitionMatchesWayfinder: MutuallyAssignable<
    RouteFormDefinition<'post'>,
    WayfinderRouteFormDefinition<'post'>
> = true;

export const resolverAcceptsGeneratedRoute: RouteResolver<'get'> =
    generatedIndexRoute;

export const mutationFnAcceptsGeneratedRoute: RouteByMethodFn<'post'> =
    generatedStoreRoute;
