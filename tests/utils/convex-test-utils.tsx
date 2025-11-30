/**
 * Convex Test Utilities
 * 
 * Utilities for testing components and hooks that depend on Convex.
 * Provides mock Convex client, provider wrappers, and helper functions.
 * 
 * @example
 * import { ConvexTestProvider, mockQuery, mockMutation } from '@/tests/utils/convex-test-utils';
 * 
 * // In test
 * render(
 *   <ConvexTestProvider>
 *     <MyConvexComponent />
 *   </ConvexTestProvider>
 * );
 */

import React, { ReactNode } from 'react';
import { vi } from 'vitest';

// Types for mock configuration
export interface MockQueryConfig<T = unknown> {
  /** The query function reference (e.g., api.workspace.getWorkspace) */
  queryPath: string;
  /** The data to return from the query */
  data: T;
  /** Optional loading state */
  loading?: boolean;
  /** Optional error state */
  error?: Error;
}

export interface MockMutationConfig<TArgs = unknown, TResult = unknown> {
  /** The mutation function reference */
  mutationPath: string;
  /** Implementation of the mutation */
  implementation?: (args: TArgs) => TResult | Promise<TResult>;
  /** If true, the mutation will reject with an error */
  error?: Error;
}

// Mock Convex context value
export interface MockConvexContextValue {
  client: MockConvexClient;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// Mock Convex client
export class MockConvexClient {
  private queryResults = new Map<string, unknown>();
  private mutationHandlers = new Map<string, (...args: unknown[]) => unknown>();
  
  /** Set a query result */
  setQueryResult<T>(path: string, data: T): void {
    this.queryResults.set(path, data);
  }
  
  /** Set a mutation handler */
  setMutationHandler<TArgs, TResult>(
    path: string, 
    handler: (args: TArgs) => TResult | Promise<TResult>
  ): void {
    this.mutationHandlers.set(path, handler as (...args: unknown[]) => unknown);
  }
  
  /** Get a query result */
  query<T>(path: string): T | undefined {
    return this.queryResults.get(path) as T | undefined;
  }
  
  /** Execute a mutation */
  async mutation<TArgs, TResult>(path: string, args: TArgs): Promise<TResult> {
    const handler = this.mutationHandlers.get(path);
    if (handler) {
      return handler(args) as TResult;
    }
    throw new Error(`No handler registered for mutation: ${path}`);
  }
  
  /** Clear all mocks */
  clear(): void {
    this.queryResults.clear();
    this.mutationHandlers.clear();
  }
}

// Store for mock data
const mockStore = {
  queries: new Map<string, { data: unknown; loading: boolean; error?: Error }>(),
  mutations: new Map<string, { fn: (...args: unknown[]) => unknown; error?: Error }>(),
};

/**
 * Configure a mock query response
 * 
 * @example
 * mockQuery('api.workspace.getWorkspace', { _id: 'ws-1', name: 'Test' });
 */
export function mockQuery<T>(queryPath: string, data: T, loading = false, error?: Error): void {
  mockStore.queries.set(queryPath, { data, loading, error });
}

/**
 * Configure a mock mutation
 * 
 * @example
 * const mockCreate = mockMutation('api.collection.create', (args) => ({ _id: 'new-id' }));
 * // Later: expect(mockCreate).toHaveBeenCalledWith({ name: 'Test' });
 */
export function mockMutation<TArgs = unknown, TResult = unknown>(
  mutationPath: string,
  implementation?: (args: TArgs) => TResult | Promise<TResult>,
  error?: Error
): ReturnType<typeof vi.fn> {
  const mockFn = vi.fn(implementation || (() => undefined));
  mockStore.mutations.set(mutationPath, { fn: mockFn as unknown as (...args: unknown[]) => unknown, error });
  return mockFn;
}

/**
 * Clear all mock queries and mutations
 */
export function clearAllMocks(): void {
  mockStore.queries.clear();
  mockStore.mutations.clear();
}

/**
 * Get the current mock data for a query
 */
export function getMockQueryData<T>(queryPath: string): T | undefined {
  return mockStore.queries.get(queryPath)?.data as T | undefined;
}

// Mock implementations for Convex React hooks
export const mockUseQuery = vi.fn((queryFn: unknown) => {
  // Try to get the function name/path
  const fnName = (queryFn as { _name?: string })?._name || String(queryFn);
  const mockData = mockStore.queries.get(fnName);
  
  if (mockData?.error) {
    throw mockData.error;
  }
  
  if (mockData?.loading) {
    return undefined; // Convex returns undefined while loading
  }
  
  return mockData?.data;
});

export const mockUseMutation = vi.fn((mutationFn: unknown) => {
  const fnName = (mutationFn as { _name?: string })?._name || String(mutationFn);
  const mockData = mockStore.mutations.get(fnName);
  
  return async (args: unknown) => {
    if (mockData?.error) {
      throw mockData.error;
    }
    return mockData?.fn(args);
  };
});

export const mockUseAction = vi.fn(() => async () => undefined);

export const mockUseConvexAuth = vi.fn(() => ({
  isLoading: false,
  isAuthenticated: true,
}));

/**
 * Create a mock Convex client for testing
 */
export function createMockConvexClient(): MockConvexClient {
  return new MockConvexClient();
}

/**
 * Props for ConvexTestProvider
 */
export interface ConvexTestProviderProps {
  children: ReactNode;
  /** Initial query data */
  queries?: Record<string, unknown>;
  /** Whether to simulate authenticated state */
  authenticated?: boolean;
  /** Whether to simulate loading state */
  loading?: boolean;
}

/**
 * Test provider that wraps components requiring Convex context.
 * 
 * @example
 * render(
 *   <ConvexTestProvider queries={{ 'api.workspace.get': mockWorkspace }}>
 *     <MyComponent />
 *   </ConvexTestProvider>
 * );
 */
export function ConvexTestProvider({
  children,
  queries = {},
  authenticated = true,
  loading = false,
}: ConvexTestProviderProps): React.ReactElement {
  // Set up initial query data
  React.useEffect(() => {
    Object.entries(queries).forEach(([path, data]) => {
      mockQuery(path, data);
    });
    
    return () => {
      clearAllMocks();
    };
  }, [queries]);
  
  // This is a simple passthrough - the actual mocking happens via vi.mock
  return <>{children}</>;
}

/**
 * Helper to create a wrapper function for renderHook
 * 
 * @example
 * const { result } = renderHook(() => useMyHook(), {
 *   wrapper: createConvexWrapper({ authenticated: true }),
 * });
 */
export function createConvexWrapper(options: Omit<ConvexTestProviderProps, 'children'> = {}) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <ConvexTestProvider {...options}>{children}</ConvexTestProvider>;
  };
}

/**
 * Setup mock for convex/react module
 * Call this in your test file or setup file:
 * 
 * @example
 * import { setupConvexMocks } from '@/tests/utils/convex-test-utils';
 * 
 * beforeAll(() => {
 *   setupConvexMocks();
 * });
 */
export function setupConvexMocks(): void {
  vi.mock('convex/react', () => ({
    useQuery: mockUseQuery,
    useMutation: mockUseMutation,
    useAction: mockUseAction,
    useConvexAuth: mockUseConvexAuth,
    usePaginatedQuery: vi.fn(() => ({
      results: [],
      status: 'Exhausted',
      loadMore: vi.fn(),
    })),
    Authenticated: ({ children }: { children: ReactNode }) => <>{children}</>,
    Unauthenticated: ({ children }: { children: ReactNode }) => <>{children}</>,
    AuthLoading: ({ children }: { children: ReactNode }) => <>{children}</>,
  }));
}

/**
 * Test data factory for common Convex entities
 */
export const testDataFactory = {
  workspace: (overrides = {}) => ({
    _id: 'ws-test-123',
    _creationTime: Date.now(),
    name: 'Test Workspace',
    slug: 'test-workspace',
    ownerId: 'user-1',
    ...overrides,
  }),
  
  user: (overrides = {}) => ({
    _id: 'user-test-123',
    _creationTime: Date.now(),
    name: 'Test User',
    email: 'test@example.com',
    externalId: 'clerk-123',
    ...overrides,
  }),
  
  collection: (overrides = {}) => ({
    _id: 'col-test-123',
    _creationTime: Date.now(),
    workspaceId: 'ws-test-123',
    label: 'Test Collection',
    slug: 'test-collection',
    ...overrides,
  }),
  
  field: (overrides = {}) => ({
    _id: 'field-test-123',
    _creationTime: Date.now(),
    tableId: 'table-test-123',
    name: 'Test Field',
    type: 'text' as const,
    position: 0,
    isRequired: false,
    isPrimary: false,
    ...overrides,
  }),
};
