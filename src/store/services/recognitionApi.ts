import { apiSlice } from "./apiSlice";
import type { ApiResponse } from "@/types/auth";
import type { RecognitionModel, SaveRecognitionRequest, PaginatedRecognitionResponse } from "@/types/recognition";

export const recognitionApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getRecognitionList: builder.query<
      PaginatedRecognitionResponse,
      {
        study_program?: string;
        institute?: string;
        lecturer_name?: string;
        lecturer_nip?: string;
        status?: string;
        category?: string;
        link_id?: string;
        sort?: string;
        limit?: number;
        page?: number;
      } | void
    >({
      query: (params) => ({
        url: "/recognition",
        method: "GET",
        params: params || undefined,
      }),
      providesTags: ["Recognition"],
    }),
    getRecognitionById: builder.query<ApiResponse<RecognitionModel>, string>({
      query: (id) => ({
        url: `/recognition/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Recognition", id }],
    }),
    createRecognition: builder.mutation<ApiResponse<RecognitionModel>, SaveRecognitionRequest>({
      query: (body) => ({
        url: "/recognition",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Recognition"],
    }),
    createPublicRecognition: builder.mutation<ApiResponse<RecognitionModel>, SaveRecognitionRequest>({
      query: (body) => ({
        url: "/recognition",
        method: "POST",
        headers: {
          "No-Auth": "true",
        },
        body,
      }),
      invalidatesTags: ["Recognition"],
    }),
    updateRecognition: builder.mutation<
      ApiResponse<RecognitionModel>,
      { id: string; body: SaveRecognitionRequest }
    >({
      query: ({ id, body }) => ({
        url: `/recognition/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Recognition"],
    }),
    deleteRecognition: builder.mutation<ApiResponse<RecognitionModel>, string>({
      query: (id) => ({
        url: `/recognition/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Recognition"],
    }),
    approveSubmission: builder.mutation<ApiResponse<RecognitionModel>, string>({
      query: (id) => ({
        url: `/recognition/${id}/approve`,
        method: "POST",
      }),
      invalidatesTags: ["Recognition"],
    }),
    rejectSubmission: builder.mutation<ApiResponse<RecognitionModel>, string>({
      query: (id) => ({
        url: `/recognition/${id}/reject`,
        method: "POST",
      }),
      invalidatesTags: ["Recognition"],
    }),
  }),
});

export const {
  useGetRecognitionListQuery,
  useGetRecognitionByIdQuery,
  useCreateRecognitionMutation,
  useCreatePublicRecognitionMutation,
  useUpdateRecognitionMutation,
  useDeleteRecognitionMutation,
  useApproveSubmissionMutation,
  useRejectSubmissionMutation,
} = recognitionApi;
