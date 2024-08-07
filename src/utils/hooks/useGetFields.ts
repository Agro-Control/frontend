import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import GetTalhao from "@/types/get-talhao";

const getFieldsRequest = async (empresa_id: number | null, unidade_id: number | null, codigo: string | null, status: string | null) => {

    
    if(isNaN(Number(unidade_id))) return;
    const { data } = await api.get<GetTalhao>("/talhoes", {
        params: {
            empresa_id: empresa_id,
            unidade_id: unidade_id,
            codigo: codigo,
            status: status,
        },
    });
    return data;
};

export const useGetFields = (enableFlag: boolean, empresa_id: number | null,  unidade_id: number | null, status: string | null, codigo: string | null) => {
    return useQuery({
        queryKey: ["fields", empresa_id, unidade_id, codigo, status],
        queryFn: () => getFieldsRequest(empresa_id, unidade_id, codigo, status),
        enabled: enableFlag,
        retry: (failureCount, error) => {

            if (error instanceof Error && error.message.includes("404")) {
                if (failureCount == 3)
                    return false;
            }

            return true;
        },
    });
};