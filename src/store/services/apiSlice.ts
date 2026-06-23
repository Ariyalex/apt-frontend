import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";

export interface CustomApiError {
  status: number;
  data: string;
}

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fakeBaseQuery<CustomApiError>(),
  tagTypes: ["Dosen", "User", "Submission"],
  endpoints: () => ({}), // Endpoints will be injected by modular service files
});

