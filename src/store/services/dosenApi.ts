import { apiSlice } from "./apiSlice";
import type { 
  LecturerListResponse, 
  SingleLecturerResponse, 
  SaveLecturerRequest 
} from "@/types/dosen";

export const dosenApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getLecturerList: builder.query<LecturerListResponse, { name?: string; study_program?: string; institute?: string; status?: string; page?: number; limit?: number } | void>({
      query: (params) => ({
        url: "/lecturer",
        method: "GET",
        params: params || undefined,
      }),
      providesTags: ["Dosen"],
    }),
    getLecturerByNip: builder.query<SingleLecturerResponse, string>({
      query: (nip) => ({
        url: `/lecturer/nip/${nip}`,
        method: "GET",
      }),
      providesTags: (result, error, nip) => [{ type: "Dosen", id: `nip-${nip}` }],
    }),
     createLecturer: builder.mutation<SingleLecturerResponse, SaveLecturerRequest>({
      query: (body) => ({
        url: "/lecturer",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Dosen"],
    }),
    createPublicLecturer: builder.mutation<SingleLecturerResponse, SaveLecturerRequest>({
      query: (body) => ({
        url: "/lecturer",
        method: "POST",
        headers: {
          "No-Auth": "true",
        },
        body,
      }),
      invalidatesTags: ["Dosen"],
    }),
    updateLecturer: builder.mutation<SingleLecturerResponse, { id: string; body: SaveLecturerRequest }>({
      query: ({ id, body }) => ({
        url: `/lecturer/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Dosen"],
    }),
    deleteLecturer: builder.mutation<SingleLecturerResponse, string>({
      query: (id) => ({
        url: `/lecturer/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Dosen"],
    }),
    approveLecturer: builder.mutation<SingleLecturerResponse, string>({
      query: (id) => ({
        url: `/lecturer/${id}/approve`,
        method: "POST",
      }),
      invalidatesTags: ["Dosen"],
    }),
    rejectLecturer: builder.mutation<SingleLecturerResponse, string>({
      query: (id) => ({
        url: `/lecturer/${id}/reject`,
        method: "POST",
      }),
      invalidatesTags: ["Dosen"],
    }),
  }),
});

export const {
  useGetLecturerListQuery,
  useGetLecturerByNipQuery,
  useLazyGetLecturerByNipQuery,
  useCreateLecturerMutation,
  useCreatePublicLecturerMutation,
  useUpdateLecturerMutation,
  useDeleteLecturerMutation,
  useApproveLecturerMutation,
  useRejectLecturerMutation,
} = dosenApi;
