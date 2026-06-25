import { apiSlice } from "./apiSlice";
import type { StudyProgramResponse, SingleStudyProgramResponse, SaveStudyProgramRequest } from "@/types/study-program";

export const studyProgramApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getStudyPrograms: builder.query<StudyProgramResponse, { name?: string; page?: number; limit?: number } | void>({
      query: (params) => ({
        url: "/study-program",
        method: "GET",
        params: params || undefined,
      }),
      providesTags: ["StudyProgram"],
    }),
    createStudyProgram: builder.mutation<SingleStudyProgramResponse, SaveStudyProgramRequest>({
      query: (body) => ({
        url: "/study-program",
        method: "POST",
        body,
      }),
      invalidatesTags: ["StudyProgram"],
    }),
    updateStudyProgram: builder.mutation<SingleStudyProgramResponse, { id: number; body: SaveStudyProgramRequest }>({
      query: ({ id, body }) => ({
        url: `/study-program/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["StudyProgram"],
    }),
    deleteStudyProgram: builder.mutation<SingleStudyProgramResponse, number>({
      query: (id) => ({
        url: `/study-program/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["StudyProgram"],
    }),
  }),
});

export const {
  useGetStudyProgramsQuery,
  useCreateStudyProgramMutation,
  useUpdateStudyProgramMutation,
  useDeleteStudyProgramMutation,
} = studyProgramApi;
