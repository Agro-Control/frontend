"use client";
import CreateCompanyModal from "@/components/control/company/create-company-modal";
import EditCompanyModal from "@/components/control/company/edit-company-modal";
import ViewCompanyModal from "@/components/control/company/view-company-modal";
import EditUserModal from "@/components/control/edit-user-modal";
import Filter from "@/components/control/filter";
import SearchBar from "@/components/control/search-bar";
import ViewUserModal from "@/components/control/view-user-modal";
import {Button} from "@/components/ui/button";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import Empresa from "@/types/empresa";
import { useGetCompanies } from "@/utils/hooks/useGetCompanies";
import {Eye, Pencil, Plus} from "@phosphor-icons/react";
import { useQueryState } from "nuqs";
import { useEffect, useState } from "react";
interface FilterItem {
    key: string;
    value: string;
}
export interface getEmpresa {
    empresas: Empresa[];
}

export interface FilterInformation {
    filterItem: FilterItem[];
    title: string;
}



export default function Companies() {
    const [cidadeFilterItems, setCidadeFilterItems] = useState<FilterItem[]>([]);
    const [estadoFilterItems, setEstadoFilterItems] = useState<FilterItem[]>([]);
    const [selectedCity, setSelectedCity] = useState("");
    const [selectedState, setSelectedState] = useState("");
    const [query, setQuery] = useQueryState("query"); 
    const { data: { empresas = [] } = {} } = useGetCompanies(selectedCity === "Todas" ? "" : selectedCity, selectedState === "Todos" ? "" : selectedState, query === null ? "" : query);
    const [estadoFilter, setEstadoFilter] = useState<FilterInformation>({
        title: "Estado",
        filterItem: [], 
    });
    const [cidadeFilter, setCidadeFilter] = useState<FilterInformation>({
        title: "Cidade",
        filterItem: [], 
    });

    useEffect(() => {
        const extractUniqueCitiesAndStates = (empresas: Empresa[]) => {
            const cidades: string[] = [];
            const estados: string[] = [];
        
            empresas.forEach((empresa) => {
                if (empresa.cidade && !cidades.includes(empresa.cidade)) {
                    cidades.push(empresa.cidade);
                }
                if (empresa.estado && !estados.includes(empresa.estado)) {
                    estados.push(empresa.estado);
                }
            });
            console.log ("cidades:" + cidades);

            const newEstadoFilterItems = estados.map((estado) => ({
                key: estado,
                value: estado, 
            }));
        
            const newCidadeFilterItems = cidades.map((cidade) => ({
                key: cidade,
                value: cidade,
            }));

            console.log ("new cidades" + newCidadeFilterItems);
            const cidadeFilterItemsWithEmptyOption = [{ key: "Todas", value: "Todas" }, ...newCidadeFilterItems];
            const estadoFilterItemsWithEmptyOption = [{ key: "Todos", value: "Todos" }, ...newEstadoFilterItems];
          
            if (JSON.stringify(newCidadeFilterItems) !== JSON.stringify(cidadeFilterItems)) {
                setCidadeFilterItems(newCidadeFilterItems);
                setCidadeFilter(prevState => ({...prevState, filterItem: cidadeFilterItemsWithEmptyOption }));

            }
            if (JSON.stringify(newEstadoFilterItems) !== JSON.stringify(estadoFilterItems)) {
                setEstadoFilterItems(newEstadoFilterItems);
                setEstadoFilter(prevState => ({...prevState, filterItem: estadoFilterItemsWithEmptyOption }));
            }
        };

        extractUniqueCitiesAndStates(empresas);
    }, [empresas, cidadeFilterItems, estadoFilterItems, setCidadeFilterItems, setCidadeFilter, query]);

  /* const filteredEmpresas = empresas.filter(empresa => {
        if (selectedCity && selectedCity !== "Todas" && empresa.cidade !== selectedCity) {
            return false; 
        }
        if (selectedState && selectedState !== "" && empresa.estado !== selectedState) {
            return false; 
        }
        return true; 
    });*/
  

    return (
        <div className="flex h-screen w-full flex-col items-center justify-start gap-10 px-6 pt-10 text-green-950 ">
            <div className="flex w-full flex-row ">
                <p className="font-poppins text-4xl font-medium">Empresas</p>
            </div>
            <div className="flex w-full flex-row items-start justify-start gap-4 ">
                <SearchBar text="Digite o nome para pesquisar..." />
                    {estadoFilterItems.length > 0 && (
                    <Filter filter={estadoFilter} paramType="estado" onSelectFilter={(selected) => setSelectedState(selected)} />
                    )}
                    {cidadeFilterItems.length > 0 && (
                        <Filter filter={cidadeFilter} paramType="cidade" onSelectFilter={(selected) => setSelectedCity(selected)} />
                    )}
                <CreateCompanyModal>
                    <Button
                        type="button"
                        className="font-regular rounded-xl bg-green-500 py-5 font-poppins text-green-950 ring-0 transition-colors hover:bg-green-600"
                    >
                        Criar
                    </Button>
                </CreateCompanyModal>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>CNPJ</TableHead>
                        <TableHead>Nome</TableHead>
                        <TableHead>Cidade</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {empresas.map((empresa) => {
                        return (
                            <TableRow key={empresa.id}>
                                <TableCell className="font-medium">{empresa.cnpj}</TableCell>
                                <TableCell className="font-medium">{empresa.nome}</TableCell>
                                <TableCell className="font-medium">{empresa.cidade}</TableCell>
                                <TableCell className="">{empresa.estado}</TableCell>
                                <TableCell className="">{empresa.status}</TableCell>
                                <TableCell className="w-28">
                                    <div className="-ml-1 flex w-full flex-row items-center gap-3">
                                      <EditCompanyModal company={empresa}>
                                            <Pencil
                                                className="h-5 w-5 cursor-pointer text-black-950 transition-colors hover:text-green-900"
                                                weight="fill"
                                            />
                                        </EditCompanyModal>
                                     <ViewCompanyModal empresa={empresa}>
                                            <Eye className="h-5 w-5 cursor-pointer text-black-950 transition-colors hover:text-green-900" />
                                     </ViewCompanyModal>
                                    </div>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
}
