"use client";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import FilterInformation from "@/types/filter-information";
import SearchBar from "@/components/control/search-bar";
import { Eye, Pencil, Plus } from "@phosphor-icons/react";
import Filter from "@/components/control/filter";
import { Button } from "@/components/ui/button";
import { useQueryState } from "nuqs";
import { useGetMachines } from "@/utils/hooks/useGetMachines";
import { useAuth } from "@/utils/hooks/useAuth";
import Maquina from "@/types/maquina";
import MachineRow from "@/components/control/machine/machine-row";
import LoadingAnimation from "@/components/loading-animation";
import StatusCodeHandler from "@/components/status-code-handler";
import { AxiosError } from "axios";
import { useEffect, useState } from "react";
import CreateMachineModal from "@/components/control/machine/create-machine-modal";
import { useGetUnits } from "@/utils/hooks/useGetUnits";
import Unidade from "@/types/unidade";
import { useGetCompanies } from "@/utils/hooks/useGetCompanies";
import Empresa from "@/types/empresa";

const statusFilter: FilterInformation = {
    filterItem: [
        { value: "all" },
        { value: "A" },
        {
            value: "I",
        },
    ],
};



const Machines = () => {
    const [query] = useQueryState("query");
    const [status] = useQueryState("status");
    const [unidade] = useQueryState("Unidades");
    const [empresa] = useQueryState("Empresas");
    const [enableFlag, setEnableFlag] = useState(false);
    const auth = useAuth();
    const user = auth.user;
    const isGestor = user?.tipo === "G";

    const {
        data: { empresas = [] } = {}, // Objeto contendo a lista de empresas
        isError: isCompanyError,
        refetch: refetchCompanies,
    } = useGetCompanies(!isGestor ? true : false, !isGestor ? parseInt(user?.grupo_id!) : null, null, null, null, null);

    const {
        data: { unidades = [] } = {},
        isLoading: isLoadingUnits, // Booleano que indica se está carregando
        refetch: refetchUnits, // Função que faz a requisição novamente
    } = useGetUnits(isGestor ? true : enableFlag, isGestor ? user.empresa_id :  parseInt(empresa!), status, query);


    const {
        data: { maquinas = [] } = {},
        error, // Erro retornado pela Api
        isError, // Booleano que indica se houve erro
        isLoading, // Booleano que indica se está carregando
        refetch, // Função que faz a requisição novamente
        isRefetching, // Booleano que indica se está fazendo a requisição novamente
    } = useGetMachines(true, parseInt(unidade!), status, query);

    const companyFilter: FilterInformation = {
        filterItem: [
            { value: "all" },
            ...empresas.map((empresa: Empresa) => ({
                value: empresa.id?.toString()!,
                label: empresa.nome,
            })),
        ],
    };

    const unitFilter: FilterInformation = {
        filterItem: [
            { value: "all" },
            ...unidades.map((unit: Unidade) => ({
                value: unit.id?.toString()!,
                label: unit.nome,
            })),
        ],
    };

    useEffect(() => {
        if (isCompanyError)
            refetchCompanies();
        if (empresa != null && empresa != "" && empresa != undefined) {
            setEnableFlag(true);
            refetchUnits();
        } else {
            setEnableFlag(false);
        }
        refetch();


    }, [empresa, unidade, query, status]);

    return (
        <div className="flex h-screen w-full flex-col items-center justify-start gap-10 px-6 pt-10 text-green-950 ">
            <div className="flex w-full flex-row ">
                <p className="font-poppins text-4xl font-medium">Máquinas</p>
            </div>
            <div className="flex w-full flex-row items-start justify-start gap-4 ">
                <SearchBar text="Digite o código para pesquisar..." />
                <Filter filter={statusFilter} paramType="status" />
                {!isGestor && <Filter filter={companyFilter} paramType="Empresas" />}
                <Filter filter={unitFilter} paramType="Unidades" />


                <CreateMachineModal>
                    <Button
                        type="button"
                        className="font-regular rounded-xl bg-green-500 py-5 font-poppins text-green-950 ring-0 transition-colors hover:bg-green-600"
                    >
                        Criar
                    </Button>
                </CreateMachineModal>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Código</TableHead>
                        <TableHead>Modelo</TableHead>
                        <TableHead>Fabricante</TableHead>
                        <TableHead>Aquisição</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Ações</TableHead>
                    </TableRow>
                </TableHeader>

                {!isError &&
                    !isLoading &&
                    maquinas.map((maquina: Maquina) => {
                        return (
                            <TableBody>
                                <MachineRow key={maquina.id} maquina={maquina} />
                            </TableBody>
                        );
                    })}
            </Table>
            {/* Renderiza a animação de loading se estiver carregando ou refazendo a requisição */}
            {isLoading && <LoadingAnimation />}
            {!isGestor && !enableFlag && <div className="flex w-full items-center justify-center font-medium">Filtre as empresas e unidades para exibir as máquinas</div>}
            {/* Renderiza o componente com as mensagens de erro se houver erro e não estiver carregando */}
            {isError && !isLoading && <StatusCodeHandler requisitionType="machine" error={error as AxiosError} />}
        </div>
    );
}

export default Machines;
