import { ApiResponse } from "@/types/auth";
import { apiSlice } from "./apiSlice";
import { uploadFileResponse } from "@/types/file-type";

const getMimeTypeByExtension = (filePath: string): string => {
  const ext = filePath.split("?")[0].split(".").pop()?.toLowerCase();
  switch (ext) {
    // image
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";

    // document
    case "pdf":
      return "application/pdf";
    case "xlsx":
      return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    case "xls":
      return "application/vnd.ms-excel";
    case "doc":
    case "docs":
      return "application/msword";
    case "docx":
      return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

    // file (archive)
    case "zip":
      return "application/zip";

    default:
      return "application/octet-stream";
  }
};

export const fileApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    uploadFile: builder.mutation<ApiResponse<uploadFileResponse>, FormData>({
      query: (formData) => ({
        url: "/uploads",
        method: "POST",
        body: formData,
      }),
    }),
    getFile: builder.mutation<string, string>({
      query: (filePath) => {
        // Clean path to point to /uploads relative to base API (/api)
        let cleanPath = filePath;
        if (cleanPath.includes("/api/uploads/")) {
          const parts = cleanPath.split("/api/uploads/");
          cleanPath = `/uploads/${parts[parts.length - 1]}`;
        } else if (cleanPath.includes("/uploads/")) {
          const parts = cleanPath.split("/uploads/");
          cleanPath = `/uploads/${parts[parts.length - 1]}`;
        } else if (cleanPath.startsWith("/api/uploads/")) {
          cleanPath = cleanPath.replace("/api/uploads/", "/uploads/");
        } else if (cleanPath.startsWith("/api/")) {
          cleanPath = cleanPath.replace("/api/", "/");
        }

        return {
          url: cleanPath,
          method: "GET",
          responseHandler: (response) =>
            response.ok ? response.blob() : response.json(),
        };
      },
      transformResponse: (response: Blob, meta, arg: string) => {
        // Determine previewable MIME type based on file extension to avoid auto-downloading
        const extMime = getMimeTypeByExtension(arg);
        const mimeType =
          extMime !== "application/octet-stream" ? extMime : response.type;

        const previewBlob = new Blob([response], { type: mimeType });
        return URL.createObjectURL(previewBlob);
      },
      transformErrorResponse: (response: { status: number | string; data?: unknown }) => {
        let message = "Gagal memuat file dari server";
        if (response.data && typeof response.data === "object") {
          const dataObj = response.data as { message?: string; error?: string };
          message = dataObj.message || dataObj.error || message;
        }
        return {
          status: response.status,
          message,
        };
      },
    }),
  }),
});

export const { useUploadFileMutation, useGetFileMutation } = fileApi;
