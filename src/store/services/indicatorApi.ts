import { ApiResponse } from "@/types/auth";
import { apiSlice } from "./apiSlice";
import { IndicatorModel, SaveIndicatorRequest } from "@/types/mutu-banpt";

export const indicatorApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getIndicatorList: builder.query<
      ApiResponse<IndicatorModel[]>,
      {
        accreditation_id: string;
        criteria:
          | `quality_culture`
          | `education_relevance`
          | `research_relevance`
          | `comunity_service_relevance`
          | `accountability`
          | string;
        target: `input` | `process` | `output` | `impact` | string;
        sort?: "newest" | "oldest" | string;
        page?: number;
        limit?: number;
      } | void
    >({
      query: (params) => ({
        url: "/accreditation/indicator",
        method: "GET",
        params: params || undefined,
      }),
      providesTags: ["AccreditationIndicator"],
    }),
    getIndicatorById: builder.query<ApiResponse<IndicatorModel>, string>({
      query: (id) => ({
        url: `/accreditation/indicator/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [
        { type: "AccreditationIndicator", id },
      ],
    }),
    createIndicator: builder.mutation<
      ApiResponse<IndicatorModel>,
      SaveIndicatorRequest
    >({
      query: (body) => ({
        url: "/accreditation/indicator",
        method: "POST",
        body,
      }),
      invalidatesTags: ["AccreditationIndicator"],
    }),
    updateIndicator: builder.mutation<
      ApiResponse<IndicatorModel>,
      { id: string; body: SaveIndicatorRequest }
    >({
      query: ({ id, body }) => ({
        url: `/accreditation/indicator/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["AccreditationIndicator"],
    }),
    deleteIndicator: builder.mutation<ApiResponse<IndicatorModel>, string>({
      query: (id) => ({
        url: `/accreditation/indicator/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["AccreditationIndicator"],
    }),
  }),
});

export const {
  useGetIndicatorListQuery,
  useGetIndicatorByIdQuery,
  useCreateIndicatorMutation,
  useUpdateIndicatorMutation,
  useDeleteIndicatorMutation,
} = indicatorApi;
