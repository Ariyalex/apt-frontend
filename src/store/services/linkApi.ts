import { apiSlice } from "./apiSlice";
import type { ApiResponse } from "@/types/auth";
import type { LinkModel, SaveLinkRequest } from "@/types/link";

export const linkApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getLinks: builder.query<ApiResponse<LinkModel[]>, void>({
      query: () => ({
        url: "/link",
        method: "GET",
      }),
      providesTags: ["Link"],
    }),
    getLinkBySlug: builder.query<ApiResponse<LinkModel>, string>({
      query: (slug) => ({
        url: `/link/slug/${slug}`,
        method: "GET",
        headers: {
          "No-Auth": "true",
        },
      }),
      providesTags: (result, error, slug) => [{ type: "Link", id: `slug-${slug}` }],
    }),
    createLink: builder.mutation<ApiResponse<LinkModel>, SaveLinkRequest>({
      query: (body) => ({
        url: "/link",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Link"],
    }),
    updateLink: builder.mutation<ApiResponse<LinkModel>, { id: string; body: SaveLinkRequest }>({
      query: ({ id, body }) => ({
        url: `/link/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Link"],
    }),
    deleteLink: builder.mutation<ApiResponse<LinkModel>, string>({
      query: (id) => ({
        url: `/link/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Link"],
    }),
  }),
});

export const {
  useGetLinksQuery,
  useGetLinkBySlugQuery,
  useCreateLinkMutation,
  useUpdateLinkMutation,
  useDeleteLinkMutation,
} = linkApi;
