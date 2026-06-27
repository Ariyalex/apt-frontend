import { apiSlice } from "./apiSlice";
import type {
  RecognitionCategoryResponse,
  SingleRecognitionCategoryResponse,
  SaveRecognitionCategoryRequest,
} from "@/types/recognition-category";

export const recognitionCategoryApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getRecognitionCategories: builder.query<RecognitionCategoryResponse, void>({
      query: () => ({
        url: "/recognition/category",
        method: "GET",
        headers: {
          "No-Auth": "true",
        },
      }),
      providesTags: ["RecognitionCategory"],
    }),
    createRecognitionCategory: builder.mutation<SingleRecognitionCategoryResponse, SaveRecognitionCategoryRequest>({
      query: (body) => ({
        url: "/recognition/category",
        method: "POST",
        body,
      }),
      invalidatesTags: ["RecognitionCategory"],
    }),
    updateRecognitionCategory: builder.mutation<SingleRecognitionCategoryResponse, { id: number; body: SaveRecognitionCategoryRequest }>({
      query: ({ id, body }) => ({
        url: `/recognition/category/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["RecognitionCategory"],
    }),
    deleteRecognitionCategory: builder.mutation<SingleRecognitionCategoryResponse, number>({
      query: (id) => ({
        url: `/recognition/category/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["RecognitionCategory"],
    }),
  }),
});

export const {
  useGetRecognitionCategoriesQuery,
  useCreateRecognitionCategoryMutation,
  useUpdateRecognitionCategoryMutation,
  useDeleteRecognitionCategoryMutation,
} = recognitionCategoryApi;
