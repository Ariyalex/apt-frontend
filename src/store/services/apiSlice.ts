import { createApi, fetchBaseQuery, BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import { setLoginSession, clearSession } from "../slices/userSlice";
import type { RootState } from "../index";
import type { AuthResponse } from "@/types/auth";

export interface CustomApiError {
  status: number;
  data: {
    message?: string;
    error?: string;
  } | string;
}

const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_BASE_API || "https://apt-uinsk.teknohole.id/api",
  prepareHeaders: (headers, { getState }) => {
    if (headers.has("No-Auth")) {
      headers.delete("No-Auth");
      return headers;
    }
    const token = (getState() as RootState).user?.accessToken || (typeof window !== "undefined" ? localStorage.getItem("accessToken") : null);
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    const refreshToken = (api.getState() as RootState).user?.refreshToken || (typeof window !== "undefined" ? localStorage.getItem("refreshToken") : null);
    
    if (refreshToken) {
      const refreshResult = await baseQuery(
        {
          url: "/refresh",
          method: "POST",
          body: { refresh_token: refreshToken },
        },
        api,
        extraOptions
      );

      if (refreshResult.data) {
        const response = refreshResult.data as AuthResponse;
        
        api.dispatch(
          setLoginSession({
            accessToken: response.data.access_token,
            refreshToken: response.data.refresh_token,
            user: response.data.user,
          })
        );
        
        result = await baseQuery(args, api, extraOptions);
      } else {
        api.dispatch(clearSession());
      }
    } else {
      api.dispatch(clearSession());
    }
  }

  return result;
};

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Dosen", "User", "Submission", "Institute", "StudyProgram", "RecognitionCategory", "Link", "Recognition"],
  endpoints: () => ({}),
});

