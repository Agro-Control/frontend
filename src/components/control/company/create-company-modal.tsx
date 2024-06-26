"use client";
import {
    Buildings,
    UserPlus,
    IdentificationCard,
    Phone,
    MapPin,
    MapTrifold,
    NavigationArrow,
    Factory,
    House,
    Hash,
    Flag,
    MagnifyingGlass,
    CircleNotch,
} from "@phosphor-icons/react";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createCompanySchema } from "@/utils/validations/createCompanySchema";
import {QueryObserverResult, RefetchOptions, useMutation, useQueryClient} from "@tanstack/react-query";
import { useGetManagers } from "@/utils/hooks/useGetManagers";
import { MaskedInput } from "@/components/ui/masked-input";
import { handleCnpjData } from "@/utils/handleCnpjData";
import SubmitButton from "@/components/submit-button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/utils/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { InputMask } from "@react-input/mask";
import GetEmpresa from "@/types/get-empresa";
import { ReactNode, useState } from "react";
import { useForm } from "react-hook-form";
import Empresa from "@/types/empresa";
import { AxiosError } from "axios";
import { api } from "@/lib/api";
import { z } from "zod";

interface CreateCompanyProps {
    children: ReactNode;

    refetchCompanies: (options?: RefetchOptions) => Promise<QueryObserverResult<GetEmpresa, Error>>
}

type Form = z.infer<typeof createCompanySchema>;

const CreateCompanyModal = ({ children, refetchCompanies }: CreateCompanyProps) => {
    // Estado que salva o carregamento da  busca do CNPJ
    const [isLoadingCnpj, setIsLoadingCnpj] = useState(false);
    const [open, setOpen] = useState(false);
    const auth = useAuth();
    const user = auth.user;
    const isAdmin = user?.tipo === "D";
    // Hook que inicia a toast 
    const { toast } = useToast();

    const queryClient = useQueryClient();
    const { t } = useTranslation();

    const form = useForm<Form>({
        resolver: zodResolver(createCompanySchema),
        defaultValues: {
            nome: "",
            cnpj: "",
            telefone: "",
            cep: "",
            estado: "",
            cidade: "",
            bairro: "",
            logradouro: "",
            numero: "",
            complemento: "",
        },
    });

    // Desenstruturando funcões do hook form
    const { getValues, setValue, watch } = form;

    // Variavel usada para monitorar o campo do cnpj
    const watchCnpj = watch("cnpj");
    // Variavel para validar o tamanho do campo do cnpj
    const cnpjValidLength = watchCnpj.length === 18;

    // Função para fazer a busca do cnpj no click
    const onHandleClick = async () => {
        setIsLoadingCnpj(true);
        const { cnpj } = getValues();
        const formattedCnpj = cnpj.replace(/\D/g, "");
        const isLengthValid = formattedCnpj.length === 14;

        if (isLengthValid) {
            const response = await handleCnpjData(formattedCnpj, setValue);
            if (response.error === true) {
                toast({
                    variant: "destructive",
                    title: "Falha ao preencher dados do CNPJ",
                    description:
                        "Ocorreu um erro na busca, ou excedeu o limite de tentativas. Por favor, tente novamente mais tarde.",
                });
            }
        }

        setIsLoadingCnpj(false);
    };
    // Função asincrona para dar o post com os dados formatados da empresa
    const createCompanyRequest = async (postData: Empresa | null) => {
        const { data } = await api.post("/empresas", postData);
        return data;
    };
 
    // Hook do react query para fazer a validação se foi sucesso ou se a requisição deu problema
    const { mutate, isPending } = useMutation({
        mutationFn: createCompanyRequest,
        onSuccess: () => {
            toast({
                duration: 1000,
                className: "border-green-500 bg-green-500",
                title: t("success"),
                description: t("postCompany-success"),
            });

            // Refetch na lista de empresas
            refetchCompanies();
            setOpen(false);
            form.reset();
        },
        onError: (error: AxiosError) => {
            const { response } = error;
            if (!response) {
                toast({
                    duration: 1000,
                    variant: "destructive",
                    title: t("network-error"),
                    description: t("network-error-description"),
                });
                return;
            }

            const { status } = response;
            const titleCode = `postCompany-error-${status}`;
            const descriptionCode = `postCompany-description-error-${status}`;

            toast({
                duration: 1000,
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
            status: "A",
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
                    <DialogTitle className="font-poppins text-green-950">Criar Empresa</DialogTitle>
                    <DialogDescription>Insira as informações para criar uma empresa.</DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onHandleSubmit)}
                        id="company-form"
                        className="grid grid-cols-2 gap-4 py-4"
                    >
                        <FormField
                            control={form.control}
                            name="cnpj"
                            render={({ field }) => (
                                <FormItem className="col-span-2 flex w-full flex-row items-start justify-center gap-3 space-y-0">
                                    <div className="flex w-full flex-col gap-2">
                                        <FormControl>
                                            <MaskedInput
                                                Icon={IdentificationCard}
                                                {...field}
                                                placeholder="CNPJ"
                                                maskInput={{ input: InputMask, mask: "__.___.___/____-__" }}
                                            />
                                        </FormControl>

                                        <FormMessage />
                                    </div>
                                    <Button
                                        onClick={onHandleClick}
                                        disabled={cnpjValidLength ? false : true}
                                        type="button"
                                        className="font-regular rounded-xl bg-green-500 py-5 font-poppins text-green-950 ring-0 transition-colors hover:bg-green-600"
                                    >
                                        {isLoadingCnpj ? (
                                            <CircleNotch className="h-5 w-5 animate-spin" />
                                        ) : (
                                            <MagnifyingGlass className="h-5 w-5" />
                                        )}
                                    </Button>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="nome"
                            render={({ field }) => (
                                <FormItem className="col-span-2">
                                    <FormControl>
                                        <Input
                                            Icon={Buildings}
                                            id="nome"
                                            placeholder="Nome da Empresa"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="telefone"
                            render={({ field }) => (
                                <FormItem className="col-span-1">
                                    <FormControl>
                                        <MaskedInput
                                            {...field}
                                            Icon={Phone}
                                            placeholder="Telefone da Empresa"
                                            maskInput={{
                                                input: InputMask,
                                                mask: "(__) _____-____",
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="cep"
                            render={({ field }) => (
                                <FormItem className="col-span-1 ">
                                    <FormControl>
                                        <MaskedInput
                                            {...field}
                                            Icon={NavigationArrow}
                                            placeholder="CEP"
                                            maskInput={{
                                                input: InputMask,
                                                mask: "_____-___",
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="estado"
                            render={({ field }) => (
                                <FormItem className="col-span-1 ">
                                    <FormControl>
                                        <Input
                                            disabled
                                            Icon={MapTrifold}
                                            id="estado"
                                            placeholder={t(field.name)}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="cidade"
                            render={({ field }) => (
                                <FormItem className="col-span-1 ">
                                    <FormControl>
                                        <Input disabled Icon={MapPin} id="cidade" placeholder="Cidade" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="bairro"
                            render={({ field }) => (
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
                            render={({ field }) => (
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
                            render={({ field }) => (
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
                            render={({ field }) => (
                                <FormItem className="col-span-1 ">
                                    <FormControl>
                                        <Input Icon={Flag} id="complemento" placeholder="Complemento" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </form>
                </Form>
                <DialogFooter>
                    <SubmitButton isLoading={isPending} form="company-form" />
                </DialogFooter>
            </DialogContent>
        </Dialog>


    );
};
export default CreateCompanyModal;
