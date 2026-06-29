import { ApiResponse } from "@/types/auth";
import { apiSlice } from "./apiSlice";

export const fileApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    uploadFile: builder.mutation<ApiResponse<string>, FormData>({
      query: (formData) => ({
        url: "/uploads",
        method: "POST",
        body: formData,
      }),
    }),
    getFile: builder.mutation<string, string>({
      query: (filePath) => {
        const cleanPath = filePath.startsWith("/api")
          ? filePath.replace("/api", "")
          : filePath;
        return {
          url: cleanPath,
          method: "GET",
          responseHandler: (response) => response.blob(),
        };
      },
      transformResponse: (response: Blob) => {
        return URL.createObjectURL(response);
      },

      // 👇 TAMBAHKAN BLOK INI
      transformErrorResponse: (response) => {
        // Cegah Blob/non-serializable object masuk ke state error Redux
        // Kembalikan objek sederhana yang aman
        return {
          status: response.status,
          message: "Gagal memuat file dari server",
        };
      },
    }),
  }),
});

export const { useUploadFileMutation, useGetFileMutation } = fileApi;
