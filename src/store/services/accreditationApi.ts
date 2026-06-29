import { ApiResponse } from "@/types/auth";
import { apiSlice } from "./apiSlice";
import { Accreditation, SaveAccreditationRequest } from "@/types/mutu-banpt";

export const accreditationApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAccreditationList: builder.query<ApiResponse<Accreditation[]>, void>({
      query: () => ({
        url: "/accreditation",
        method: "GET",
      }),
      providesTags: ["Accreditation"],
    }),
    createAccreditation: builder.mutation<
      ApiResponse<Accreditation>,
      SaveAccreditationRequest
    >({
      query: (body) => ({
        url: "/accreditation",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Accreditation"],
    }),
    updateAccreditation: builder.mutation<
      ApiResponse<Accreditation>,
      { id: string; body: SaveAccreditationRequest }
    >({
      query: ({ body, id }) => ({
        url: `/accreditation/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Accreditation"],
    }),
    deleteAccreditation: builder.mutation<ApiResponse<Accreditation>, string>({
      query: (id) => ({
        url: `/accreditation/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Accreditation"],
    }),
  }),
});

export const {
  useGetAccreditationListQuery,
  useCreateAccreditationMutation,
  useUpdateAccreditationMutation,
  useDeleteAccreditationMutation,
} = accreditationApi;
