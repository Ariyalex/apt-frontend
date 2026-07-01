import { apiSlice } from "./apiSlice";
import type { ApiResponse } from "@/types/auth";
import type { LogModel, GetLogsParams, PaginatedApiResponse } from "@/types/log";

export const logApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getLogs: builder.query<PaginatedApiResponse<LogModel[]>, GetLogsParams | void>({
      query: (params) => ({
        url: "/log",
        method: "GET",
        params: params || undefined,
      }),
      providesTags: ["User"],
    }),
    deleteLog: builder.mutation<ApiResponse<LogModel>, string>({
      query: (id) => ({
        url: `/log/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["User"],
    }),
    cleanOlderLogs: builder.mutation<ApiResponse<null>, number>({
      query: (days) => ({
        url: `/log-older-than/${days}`,
        method: "POST",
      }),
      invalidatesTags: ["User"],
    }),
  }),
});

export const {
  useGetLogsQuery,
  useDeleteLogMutation,
  useCleanOlderLogsMutation,
} = logApi;
