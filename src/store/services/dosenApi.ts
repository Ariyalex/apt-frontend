import { apiSlice, CustomApiError } from "./apiSlice";
import { Dosen, DosenPengajuan } from "@/types/dosen";
import { initialDosenList, initialDosenPengajuanList } from "@/dummy-data/dosen";

export const dosenApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDosenList: builder.query<Dosen[], void>({
      async queryFn(): Promise<{ data: Dosen[] }> {
        // Simulate network delay
        await new Promise<void>((resolve) => setTimeout(resolve, 800));
        return { data: [...initialDosenList] };
      },
      providesTags: ["Dosen"],
    }),
    createDosen: builder.mutation<Dosen, Dosen>({
      async queryFn(newDosen: Dosen): Promise<{ data: Dosen }> {
        await new Promise<void>((resolve) => setTimeout(resolve, 1000));
        // Add directly to mock database
        initialDosenList.push(newDosen);
        return { data: newDosen };
      },
      invalidatesTags: ["Dosen"],
    }),
    updateDosen: builder.mutation<Dosen, { nip: string; updatedData: Dosen }>({
      async queryFn({ nip, updatedData }: { nip: string; updatedData: Dosen }): Promise<{ data: Dosen } | { error: CustomApiError }> {
        await new Promise<void>((resolve) => setTimeout(resolve, 1000));
        const idx = initialDosenList.findIndex((d) => d.nip === nip);
        if (idx !== -1) {
          initialDosenList[idx] = updatedData;
          return { data: updatedData };
        }
        return { error: { status: 404, data: "Dosen tidak ditemukan" } };
      },
      invalidatesTags: ["Dosen"],
    }),
    deleteDosen: builder.mutation<string, string>({
      async queryFn(nip: string): Promise<{ data: string }> {
        await new Promise<void>((resolve) => setTimeout(resolve, 1000));
        const idx = initialDosenList.findIndex((d) => d.nip === nip);
        if (idx !== -1) {
          initialDosenList.splice(idx, 1);
        }
        return { data: nip };
      },
      invalidatesTags: ["Dosen"],
    }),
    
    // Submissions (Pengajuan Dosen)
    getPengajuanList: builder.query<DosenPengajuan[], void>({
      async queryFn(): Promise<{ data: DosenPengajuan[] }> {
        await new Promise<void>((resolve) => setTimeout(resolve, 800));
        return { data: [...initialDosenPengajuanList] };
      },
      providesTags: ["Submission"],
    }),
    createPengajuan: builder.mutation<DosenPengajuan, Dosen>({
      async queryFn(newDosen: Dosen): Promise<{ data: DosenPengajuan }> {
        await new Promise<void>((resolve) => setTimeout(resolve, 1000));
        const submission: DosenPengajuan = {
          ...newDosen,
          id: `pengajuan-${Date.now()}`,
          status: "pending",
          submittedAt: new Date().toISOString(),
        };
        initialDosenPengajuanList.push(submission);
        return { data: submission };
      },
      invalidatesTags: ["Submission"],
    }),
    approvePengajuan: builder.mutation<Dosen, DosenPengajuan>({
      async queryFn(pengajuan: DosenPengajuan): Promise<{ data: Dosen }> {
        await new Promise<void>((resolve) => setTimeout(resolve, 1000));
        
        // Remove from submission list
        const subIdx = initialDosenPengajuanList.findIndex((p) => p.id === pengajuan.id);
        if (subIdx !== -1) {
          initialDosenPengajuanList.splice(subIdx, 1);
        }
        
        // Add to main dosen list
        const newDosen: Dosen = {
          nip: pengajuan.nip,
          nama: pengajuan.nama,
          fakultas: pengajuan.fakultas,
          prodi: pengajuan.prodi,
          email: pengajuan.email,
        };
        initialDosenList.push(newDosen);
        
        return { data: newDosen };
      },
      invalidatesTags: ["Dosen", "Submission"],
    }),
    declinePengajuan: builder.mutation<string, string>({
      async queryFn(id: string): Promise<{ data: string }> {
        await new Promise<void>((resolve) => setTimeout(resolve, 1000));
        const idx = initialDosenPengajuanList.findIndex((p) => p.id === id);
        if (idx !== -1) {
          initialDosenPengajuanList.splice(idx, 1);
        }
        return { data: id };
      },
      invalidatesTags: ["Submission"],
    }),
    updatePengajuan: builder.mutation<DosenPengajuan, DosenPengajuan>({
      async queryFn(updated: DosenPengajuan): Promise<{ data: DosenPengajuan } | { error: CustomApiError }> {
        await new Promise<void>((resolve) => setTimeout(resolve, 1000));
        const idx = initialDosenPengajuanList.findIndex((p) => p.id === updated.id);
        if (idx !== -1) {
          initialDosenPengajuanList[idx] = updated;
          return { data: updated };
        }
        return { error: { status: 404, data: "Pengajuan tidak ditemukan" } };
      },
      invalidatesTags: ["Submission"],
    }),
  }),
});

export const {
  useGetDosenListQuery,
  useCreateDosenMutation,
  useUpdateDosenMutation,
  useDeleteDosenMutation,
  useGetPengajuanListQuery,
  useCreatePengajuanMutation,
  useApprovePengajuanMutation,
  useDeclinePengajuanMutation,
  useUpdatePengajuanMutation,
} = dosenApi;
