import { apiSlice } from "./apiSlice";
import type { InstituteResponse, SingleInstituteResponse, SaveInstituteRequest } from "@/types/institute";

export const instituteApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getInstitutes: builder.query<InstituteResponse, { name?: string } | void>({
      query: (params) => ({
        url: "/institute",
        method: "GET",
        params: params?.name ? { name: params.name } : undefined,
      }),
      providesTags: ["Institute"],
    }),
    createInstitute: builder.mutation<SingleInstituteResponse, SaveInstituteRequest>({
      query: (body) => ({
        url: "/institute",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Institute"],
    }),
    updateInstitute: builder.mutation<SingleInstituteResponse, { id: number; body: SaveInstituteRequest }>({
      query: ({ id, body }) => ({
        url: `/institute/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Institute", "User"],
    }),
    deleteInstitute: builder.mutation<SingleInstituteResponse, number>({
      query: (id) => ({
        url: `/institute/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Institute", "User"],
    }),
  }),
});

export const {
  useGetInstitutesQuery,
  useCreateInstituteMutation,
  useUpdateInstituteMutation,
  useDeleteInstituteMutation,
} = instituteApi;
