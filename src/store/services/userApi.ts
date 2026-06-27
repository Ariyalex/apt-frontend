import { apiSlice } from "./apiSlice";
import type { ApiResponse } from "@/types/auth";
import type { UserAdminModel, AddUserRequest, EditUserRequest } from "@/types/user";

export const userApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<ApiResponse<UserAdminModel[]>, void>({
      query: () => ({
        url: "/user",
        method: "GET",
      }),
      providesTags: ["User"],
    }),
    createUser: builder.mutation<ApiResponse<UserAdminModel>, AddUserRequest>({
      query: (body) => ({
        url: "/user",
        method: "POST",
        body,
      }),
      invalidatesTags: ["User"],
    }),
    updateUser: builder.mutation<ApiResponse<UserAdminModel>, { id: string; body: EditUserRequest }>({
      query: ({ id, body }) => ({
        url: `/user/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["User"],
    }),
    deleteUser: builder.mutation<ApiResponse<UserAdminModel>, string>({
      query: (id) => ({
        url: `/user/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["User"],
    }),
    resetUserPassword: builder.mutation<ApiResponse<UserAdminModel>, string>({
      query: (id) => ({
        url: `/user/${id}/reset-password`,
        method: "POST",
      }),
      invalidatesTags: ["User"],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useResetUserPasswordMutation,
} = userApi;
