/**
 * useOptimisticConvexMutation
 * 
 * A hook for optimistic updates with Convex mutations.
 * Provides instant UI feedback while the mutation is in flight.
 * 
 * Features:
 * - Optimistic state updates before mutation completes
 * - Automatic rollback on error
 * - Loading and error states
 * - Toast notifications
 * - Type-safe Convex integration
 * 
 * @example
 * const { mutate, isLoading, optimisticData } = useOptimisticConvexMutation({
 *   mutation: api.teams.create,
 *   getOptimisticData: (args) => ({ id: "temp-id", name: args.name, _isPending: true }),
 *   onSuccess: (result) => toast({ title: "Team created!" }),
 *   onError: (error) => toast({ title: "Failed to create team", variant: "destructive" }),
 * });
 */

"use client";

import * as React from "react";
import { useMutation } from "convex/react";
import type { FunctionReference, FunctionArgs, FunctionReturnType } from "convex/server";

export interface OptimisticMutationOptions<
  Mutation extends FunctionReference<"mutation">,
  OptimisticData = unknown
> {
  /** The Convex mutation function reference */
  mutation: Mutation;
  
  /** 
   * Function to generate optimistic data from mutation arguments.
   * Return null/undefined to skip optimistic update.
   */
  getOptimisticData?: (args: FunctionArgs<Mutation>) => OptimisticData | null | undefined;
  
  /** Callback when mutation succeeds */
  onSuccess?: (result: FunctionReturnType<Mutation>, args: FunctionArgs<Mutation>) => void;
  
  /** Callback when mutation fails */
  onError?: (error: Error, args: FunctionArgs<Mutation>) => void;
  
  /** Callback when mutation completes (success or error) */
  onSettled?: (
    result: FunctionReturnType<Mutation> | undefined,
    error: Error | null,
    args: FunctionArgs<Mutation>
  ) => void;
  
  /** Delay before showing error (allows for retry) */
  errorDelay?: number;
}

export interface OptimisticMutationReturn<
  Mutation extends FunctionReference<"mutation">,
  OptimisticData = unknown
> {
  /** Execute the mutation with optimistic update */
  mutate: (args: FunctionArgs<Mutation>) => Promise<FunctionReturnType<Mutation>>;
  
  /** Current optimistic data (null when not in flight) */
  optimisticData: OptimisticData | null;
  
  /** Whether the mutation is in progress */
  isLoading: boolean;
  
  /** Last error encountered */
  error: Error | null;
  
  /** Clear the current error state */
  clearError: () => void;
}

export function useOptimisticConvexMutation<
  Mutation extends FunctionReference<"mutation">,
  OptimisticData = unknown
>(
  options: OptimisticMutationOptions<Mutation, OptimisticData>
): OptimisticMutationReturn<Mutation, OptimisticData> {
  const {
    mutation,
    getOptimisticData,
    onSuccess,
    onError,
    onSettled,
    errorDelay = 0,
  } = options;

  const convexMutation = useMutation(mutation);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);
  const [optimisticData, setOptimisticData] = React.useState<OptimisticData | null>(null);

  const clearError = React.useCallback(() => {
    setError(null);
  }, []);

  const mutate = React.useCallback(
    async (args: FunctionArgs<Mutation>): Promise<FunctionReturnType<Mutation>> => {
      setIsLoading(true);
      setError(null);

      // Set optimistic data immediately
      if (getOptimisticData) {
        const optimistic = getOptimisticData(args);
        if (optimistic !== null && optimistic !== undefined) {
          setOptimisticData(optimistic);
        }
      }

      try {
        const result = await convexMutation(args);
        
        // Clear optimistic data on success
        setOptimisticData(null);
        setIsLoading(false);
        
        onSuccess?.(result, args);
        onSettled?.(result, null, args);
        
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        
        // Clear optimistic data (rollback)
        setOptimisticData(null);
        
        if (errorDelay > 0) {
          setTimeout(() => {
            setError(error);
            setIsLoading(false);
            onError?.(error, args);
            onSettled?.(undefined, error, args);
          }, errorDelay);
        } else {
          setError(error);
          setIsLoading(false);
          onError?.(error, args);
          onSettled?.(undefined, error, args);
        }
        
        throw error;
      }
    },
    [convexMutation, getOptimisticData, onSuccess, onError, onSettled, errorDelay]
  );

  return {
    mutate,
    optimisticData,
    isLoading,
    error,
    clearError,
  };
}

/**
 * Higher-order hook to wrap a Convex mutation with optimistic updates
 * and common patterns like toast notifications.
 */
export function createOptimisticMutation<
  Mutation extends FunctionReference<"mutation">,
  OptimisticData = unknown
>(
  mutation: Mutation,
  options?: Omit<OptimisticMutationOptions<Mutation, OptimisticData>, "mutation">
) {
  return function useWrappedMutation() {
    return useOptimisticConvexMutation<Mutation, OptimisticData>({
      mutation,
      ...options,
    });
  };
}

export default useOptimisticConvexMutation;
