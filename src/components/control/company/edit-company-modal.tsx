"use client";
import {
    Buildings,
    IdentificationCard,
    Phone,
    MapPin,
    MapTrifold,
    NavigationArrow,
    Factory,
    House,
    Hash,
    Flag,
    UserPlus,
} from "@phosphor-icons/react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {QueryObserverResult, RefetchOptions, useMutation, useQueryClient} from "@tanstack/react-query";
import {Form, FormControl, FormField, FormItem, FormMessage} from "@/components/ui/form";
import {editCompanySchema} from "@/utils/validations/editCompanySchema";
import {zodResolver} from "@hookform/resolvers/zod";
import SubmitButton from "@/components/submit-button";
import {toast} from "@/components/ui/use-toast";
import {useAuth} from "@/utils/hooks/useAuth";
import {useTranslation} from "react-i18next";
import {Input} from "@/components/ui/input";
import GetEmpresa from "@/types/get-empresa";
import {ReactNode, useState} from "react";
import {useForm} from "react-hook-form";
import Empresa from "@/types/empresa";
import {AxiosError} from "axios";
import {api} from "@/lib/api";
import {z} from "zod";

interface EditCompanyProps {
    company: Empresa;
    children: ReactNode;
    isSingleCompany: boolean;
    refetchCompanies?: (options?: RefetchOptions) => Promise<QueryObserverResult<GetEmpresa, Error>>;
    refetchEmpresa?: (options?: RefetchOptions) => Promise<QueryObserverResult<any, Error>>;
}

type Form = z.infer<typeof editCompanySchema>;

const EditCompanyModal = ({
    children,
    company,
    isSingleCompany,
    refetchCompanies,
    refetchEmpresa,
}: EditCompanyProps) => {
    const {t} = useTranslation();
    const [open, setOpen] = useState(false);
    const queryClient = useQueryClient();
    const auth = useAuth();
    const user = auth.user;
    const isAdmin = user?.tipo === "D";
    const [statusOptions, setStatusOptions] = useState<{value: string}[]>([{value: "A"}, {value: "I"}]);

    /*  const {
        data: {usuarios : gestores = []} = {}, // Objeto contendo a lista de gestores
        error, // Erro retornado pela Api
        isError, // Booleano que indica se houve erro
        isLoading, // Booleano que indica se está carregando
        refetch, // Função que faz a requisição novamente
        isRefetching, // Booleano que indica se está fazendo a requisição novamente
    } = useGetManagers(isAdmin ? user?.grupo_id : null, null, null, "G");*/

    const form = useForm<Form>({
        resolver: zodResolver(editCompanySchema),
        defaultValues: {
            id: company.id,
            nome: company.nome,
            cnpj: company.cnpj,
            telefone: company.telefone,
            cep: company.cep,
            estado: company.estado,
            cidade: company.cidade,
            bairro: company.bairro,
            logradouro: company.logradouro,
            numero: company.numero || "",
            complemento: company.complemento || "",
            status: company.status,
        },
    });

    const createCompanyRequest = async (putData: Empresa | null) => {
        const {data} = await api.put("/empresas", putData);
        return data;
    };

    // Hook do react query para fazer a validação se foi sucesso ou se a requisição deu problema
    const {mutate, isPending} = useMutation({
        mutationFn: createCompanyRequest,
        onSuccess: () => {
            toast({
                className: "border-green-500 bg-green-500",
                title: t("success"),
                description: t("putCompany-success"),
            });

            isSingleCompany ? refetchEmpresa?.() : refetchCompanies?.();
            setOpen(false);
            form.reset();
        },
        onError: (error: AxiosError) => {
            const {response} = error;
            if (!response) {
                toast({
                    variant: "destructive",
                    title: t("network-error"),
                    description: t("network-error-description"),
                });
                return;
            }

            const {status} = response;
            const titleCode = `postCompany-error-${status}`;
            const descriptionCode = `postCompany-description-error-${status}`;

            toast({
                variant: "destructive",
                title: t(titleCode),
                description: t(descriptionCode),
            });
        },
    });

    // Função de submit do formulário de criação de empresa
    const onHandleSubmit = (data: Form) => {
        const formattedData = {
            ...data,
            cnpj: data.cnpj.replace(/\D/g, ""),
            telefone: data.telefone.replace(/\D/g, ""),
            cep: data.cep.replace(/\D/g, ""),
            status: data.status,
            data_criacao: company.data_criacao,
            grupo_id: user?.grupo_id,
        };
        // Aqui chama a função mutate do reactquery, jogando os dados formatados pra fazer a logica toda
        mutate(formattedData);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                    <DialogTitle className="font-poppins text-green-950">Editar Empresa</DialogTitle>
                    <DialogDescription>Insira as informações para alterar a empresa.</DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onHandleSubmit)}
                        id="edit-company-form"
                        className="grid grid-cols-2 gap-4 py-4"
                    >
                        <FormField
                            control={form.control}
                            name="nome"
                            render={({field}) => (
                                <FormItem className="col-span-2">
                                    <FormControl>
                                        <Input Icon={Buildings} id="nome" placeholder="Nome da Empresa" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="cnpj"
                            render={({field}) => (
                                <FormItem className="col-span-1">
                                    <FormControl>
                                        <Input
                                            Icon={IdentificationCard}
                                            disabled
                                            id="cnpj"
                                            placeholder="CNPJ"
                                            {...field}
                                            readOnly
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="telefone"
                            render={({field}) => (
                                <FormItem className="col-span-1">
                                    <FormControl>
                                        <Input
                                            Icon={Phone}
                                            id="telefone"
                                            placeholder="Telefone da Empresa"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="cep"
                            render={({field}) => (
                                <FormItem className="col-span-1 ">
                                    <FormControl>
                                        <Input Icon={NavigationArrow} id="cep" placeholder="CEP" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="estado"
                            render={({field}) => (
                                <FormItem className="col-span-1 ">
                                    <FormControl>
                                        <Input Icon={MapTrifold} id="estado" placeholder={t(field.name)} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="cidade"
                            render={({field}) => (
                                <FormItem className="col-span-1 ">
                                    <FormControl>
                                        <Input Icon={MapPin} id="cidade" placeholder="Cidade" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="bairro"
                            render={({field}) => (
                                <FormItem className="col-span-1 ">
                                    <FormControl>
                                        <Input Icon={Factory} id="bairro" placeholder="Bairro" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="logradouro"
                            render={({field}) => (
                                <FormItem className="col-span-1 ">
                                    <FormControl>
                                        <Input Icon={House} id="logradouro" placeholder="Endereço" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="numero"
                            render={({field}) => (
                                <FormItem className="col-span-1 ">
                                    <FormControl>
                                        <Input Icon={Hash} id="numero" placeholder="Número" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="complemento"
                            render={({field}) => (
                                <FormItem className="col-span-1 ">
                                    <FormControl>
                                        <Input Icon={Flag} id="complemento" placeholder="Complemento" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="status"
                            render={({field}) => (
                                <FormItem className="col-span-1">
                                    <FormControl>
                                        <Select
                                            onValueChange={(value) => {
                                                form.setValue("status", value);
                                            }}
                                        >
                                            <SelectTrigger className="h-10 w-full">
                                                <SelectValue placeholder="Selecione o Status" {...field} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {statusOptions.map((option) => (
                                                    <SelectItem key={option.value} value={option.value}>
                                                        {t(option.value)}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </form>
                </Form>
                <DialogFooter>
                    <SubmitButton isLoading={isPending} form="edit-company-form" />
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
export default EditCompanyModal;
