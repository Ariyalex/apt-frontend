import { ApiResponse } from "@/types/auth";
import { apiSlice } from "./apiSlice";
import { AssessmentRule, SaveAssessmentRuleRequest } from "@/types/mutu-banpt";

export const assessmentRuleApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAssessmentRuleList: builder.query<
      ApiResponse<AssessmentRule[]>,
      {
        indicator_id?: string;
        sort?: "newest" | "oldest" | string;
        page?: number;
        limit?: number;
      } | void
    >({
      query: (params) => ({
        url: "/accreditation/indicator/rule",
        method: "GET",
        params: params || undefined,
      }),
      providesTags: ["AssessmentRule"],
    }),
    getAssessmentRuleById: builder.query<ApiResponse<AssessmentRule>, string>({
      query: (id) => ({
        url: `/accreditation/indicator/rule/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "AssessmentRule", id }],
    }),
    createAssessmentRule: builder.mutation<
      ApiResponse<AssessmentRule>,
      SaveAssessmentRuleRequest
    >({
      query: (body) => ({
        url: `/accreditation/indicator/rule`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["AssessmentRule"],
    }),
    updateAssessmentRule: builder.mutation<
      ApiResponse<AssessmentRule>,
      { id: string; body: SaveAssessmentRuleRequest }
    >({
      query: ({ id, body }) => ({
        url: `/accreditation/indicator/rule/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["AssessmentRule"],
    }),
    deleteAssessmentRule: builder.mutation<ApiResponse<AssessmentRule>, string>(
      {
        query: (id) => ({
          url: `/accreditation/indicator/rule/${id}`,
          method: "DELETE",
        }),
        invalidatesTags: ["AssessmentRule"],
      },
    ),
  }),
});

export const {
  useGetAssessmentRuleListQuery,
  useGetAssessmentRuleByIdQuery,
  useCreateAssessmentRuleMutation,
  useUpdateAssessmentRuleMutation,
  useDeleteAssessmentRuleMutation,
} = assessmentRuleApi;
