import {
  AssessmentEvaluation,
  SaveAssessmentEvaluationRequest,
} from "@/types/mutu-banpt";
import { apiSlice } from "./apiSlice";
import { ApiResponse } from "@/types/auth";

export const assessmentEvaluationApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAssessmentEvaluationList: builder.query<
      ApiResponse<AssessmentEvaluation[]>,
      {
        accreditation_id: string;
        indicator_id?: string;
        rule_id?: string;
        user_id?: string;
        institute_id?: string;
        study_program_id?: string;
        sort?: "newest" | "oldest" | string;
        page?: number;
        limit?: number;
      } | void
    >({
      query: (params) => ({
        url: "/accreditation/indicator/evaluation",
        method: "GET",
        params: params || undefined,
      }),
      providesTags: ["AssessmentEvaluation"],
    }),
    getAssessmentEvaluationById: builder.query<
      ApiResponse<AssessmentEvaluation>,
      string
    >({
      query: (id) => ({
        url: `/accreditation/indicator/evaluation/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [
        { type: "AssessmentEvaluation", id },
      ],
    }),
    createAssessmentEvaluation: builder.mutation<
      ApiResponse<AssessmentEvaluation>,
      SaveAssessmentEvaluationRequest
    >({
      query: (body) => ({
        url: `/accreditation/indicator/evaluation`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["AssessmentEvaluation"],
    }),
    updateAssessmentEvaluation: builder.mutation<
      ApiResponse<AssessmentEvaluation>,
      { id: string; body: SaveAssessmentEvaluationRequest }
    >({
      query: ({ id, body }) => ({
        url: `/accreditation/indicator/evaluation/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["AssessmentEvaluation"],
    }),
    deleteAssessmentEvaluation: builder.mutation<
      ApiResponse<AssessmentEvaluation>,
      string
    >({
      query: (id) => ({
        url: `/accreditation/indicator/evaluation/${id}`, // Added slash for delete url
        method: "DELETE",
      }),
      invalidatesTags: ["AssessmentEvaluation"],
    }),
  }),
});

export const {
  useGetAssessmentEvaluationListQuery,
  useGetAssessmentEvaluationByIdQuery,
  useCreateAssessmentEvaluationMutation,
  useUpdateAssessmentEvaluationMutation,
  useDeleteAssessmentEvaluationMutation,
} = assessmentEvaluationApi;
