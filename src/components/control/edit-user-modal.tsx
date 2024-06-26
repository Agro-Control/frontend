"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {User, EnvelopeSimple, IdentificationCard, Phone, SunHorizon, Factory} from "@phosphor-icons/react";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Form, FormControl, FormField, FormItem, FormMessage} from "@/components/ui/form";
import {QueryObserverResult, RefetchOptions, useMutation} from "@tanstack/react-query";
import {editUserSchema} from "@/utils/validations/editUserSchema";
import {useGetCompanies} from "@/utils/hooks/useGetCompanies";
import {MaskedInput} from "@/components/ui/masked-input";
import { useGetUnits } from "@/utils/hooks/useGetUnits";
import formatPhone from "@/utils/functions/formatPhone";
import SubmitButton from "@/components/submit-button";
import {zodResolver} from "@hookform/resolvers/zod";
import formatCpf from "@/utils/functions/formatCpf";
import GetOperador from "@/types/get-operador";
import {useAuth} from "@/utils/hooks/useAuth";
import {InputMask} from "@react-input/mask";
import {Input} from "@/components/ui/input";
import GetGestor from "@/types/get-gestor";
import {ReactNode, useState} from "react";
import {useToast} from "../ui/use-toast";
import {useForm} from "react-hook-form";
import Operador from "@/types/operador";
import Unidade from "@/types/unidade";
import {Gestor} from "@/types/gestor";
import {AxiosError} from "axios";
import api from "@/lib/api";
import {z} from "zod";

import {useTranslation} from "react-i18next";
type Form = z.infer<typeof editUserSchema>;


interface DataError {

    error: string;
}
interface EditUserProps {
    userInformation: Operador | Gestor;
    children: ReactNode;
    refetchOperators?: (options?: RefetchOptions) => Promise<QueryObserverResult<GetOperador, Error>>;
    refetchManager?: (options?: RefetchOptions) => Promise<QueryObserverResult<GetGestor, Error>>;
}

const EditUserModal = ({children, userInformation, refetchOperators, refetchManager}: EditUserProps) => {
    const [open, setOpen] = useState(false);
    const {toast} = useToast();
    const auth = useAuth();
    const user = auth.user;
    const isAdmin = user?.tipo === "D";
    const empresa_id = user && user?.empresa_id;
    const grupo_id = user && user?.grupo_id;
    const whichRoleCreate = isAdmin ? "Gestor" : "Operador";

  const {
        data: { unidades = [] } = {}, // Objeto contendo a lista de unidades
    } = useGetUnits(!isAdmin, empresa_id, grupo_id, null, null);


    const {t} = useTranslation();
    const {data: {empresas = []} = {}, refetch: refetchCompanies} = useGetCompanies(
        false,
        grupo_id,
        null,
        null,
        "A",
        true,
    );

    const form = useForm<Form>({
        resolver: zodResolver(editUserSchema),
        defaultValues: {
            nome: userInformation.nome,
            email: userInformation.email || "",
            cpf: formatCpf(userInformation.cpf),
            telefone: formatPhone(userInformation.telefone) || "",
            turno: userInformation.turno || "",
            status: userInformation.status,
            empresa_id: String(userInformation.empresa_id) || "",
            unidade_id: String(userInformation.empresa_id) || "",
        },
    });

    const editUserRequest = async (putData: Operador | Gestor | null) => {
        const url = isAdmin ? "/gestores" : "/operadores";
        const {data} = await api.put(url, putData);
        return data;
    };

    const {mutate, isPending} = useMutation({
        mutationFn: editUserRequest,
        onSuccess: () => {
            toast({
                duration: 1000,
                className: "border-green-500 bg-green-500",
                title: t("success"),
                description: t(`put${whichRoleCreate}-success`),
            });
            isAdmin ? refetchManager?.() : refetchOperators?.();
            isAdmin && refetchCompanies();
            setOpen(false);
            form.reset();
        },
        onError: (error: AxiosError) => {
            const {response} = error;
            if (!response) {
                toast({
                    duration: 1000,
                    variant: "destructive",
                    title: t("network-error"),
                    description: t("network-error-description"),
                });
                return;
            }

            const {status, data} = response;
            const dataError = data as DataError;
            const errorMessage = dataError.error;
            const titleCode = status === 409 ? errorMessage : `put${whichRoleCreate}-error-${status}`;
            const descriptionCode =  `put${whichRoleCreate}-description-error-${status}`;

            toast({
                duration: 1000,
                variant: "destructive",
                title: t(titleCode),
                description: t(descriptionCode),
            });
        },
    });

    function onSubmit(data: Form) {
        const formattedData = {
            ...userInformation,
            empresa_id: Number(data.empresa_id),
            unidade_id: isAdmin ? null : data.unidade_id,
            nome: data.nome,
            email: data.email,
            turno: data.turno || "",
            status: data.status,
            cpf: data.cpf.replace(/\D/g, ""),
            telefone: data.telefone.replace(/\D/g, ""),
        };
        mutate(formattedData);
        console.log(formattedData);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                    <DialogTitle className="font-poppins text-green-950">Editar usuário</DialogTitle>
                    <DialogDescription>Insira as informações para alterar o usuário.</DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        id="edit-user-form"
                        className="grid grid-cols-2 gap-4 py-4"
                    >
                        <FormField
                            control={form.control}
                            name="nome"
                            render={({field}) => (
                                <FormItem className="col-span-2 ">
                                    <FormControl>
                                        <Input Icon={User} className="" id="name" placeholder="Nome" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="email"
                            render={({field}) => (
                                <FormItem className="col-span-2">
                                    <FormControl>
                                        <Input Icon={EnvelopeSimple} id="email" placeholder="Email" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {!isAdmin && (
                            <FormField
                                control={form.control}
                                name="turno"
                                render={({field}) => (
                                    <FormItem className="col-span-1 ">
                                        <FormControl>
                                            <Select
                                                onValueChange={(value) => {
                                                    form.setValue("turno", value);
                                                }}
                                            >
                                                <SelectTrigger Icon={SunHorizon} className="h-10 w-full ">
                                                    <SelectValue placeholder="Turno" {...field} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="M">Manhã</SelectItem>
                                                    <SelectItem value="T">Tarde</SelectItem>
                                                    <SelectItem value="N">Noite</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}
                        <FormField
                            control={form.control}
                            name="status"
                            render={({field}) => (
                                <FormItem className="col-span-1 ">
                                    <FormControl>
                                        <Select
                                            onValueChange={(value) => {
                                                form.setValue("status", value);
                                            }}
                                        >
                                            <SelectTrigger className="h-10 w-full ">
                                                <SelectValue
                                                    placeholder={t(userInformation.status)}
                                                    defaultValue={userInformation.status}
                                                    {...field}
                                                />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="A">Ativo</SelectItem>
                                                <SelectItem value="I">Inativo</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="cpf"
                            render={({field}) => (
                                <FormItem className="col-span-1 ">
                                    <FormControl>
                                        <MaskedInput
                                            maskInput={{
                                                input: InputMask,
                                                mask: "___.___.___-__",
                                            }}
                                            Icon={IdentificationCard}
                                            id="identifier"
                                            placeholder="CPF"
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
                            render={({field}) => (
                                <FormItem className="col-span-1 ">
                                    <FormControl>
                                        <MaskedInput
                                            maskInput={{
                                                input: InputMask,
                                                mask: "(__) _____-____",
                                            }}
                                            Icon={Phone}
                                            id="phone"
                                            placeholder="Telefone"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        {isAdmin ? (
                            <FormField
                                control={form.control}
                                name="empresa_id"
                                render={({field}) => (
                                    <FormItem className="col-span-1 ">
                                        <FormControl>
                                            <Select
                                                onValueChange={(value) => {
                                                    form.setValue("empresa_id", value);
                                                }}
                                            >
                                                <SelectTrigger Icon={Factory} className="h-10 w-full ">
                                                    <SelectValue placeholder={userInformation.empresa} {...field} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value={userInformation.empresa_id.toString()}>
                                                        {userInformation.empresa}
                                                    </SelectItem>
                                                    {empresas.map((company) => (
                                                        <SelectItem key={company.id} value={company.id!.toString()}>
                                                            {company.nome}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )
                    : (
                        <FormField
                        control={form.control}
                        name="unidade_id"
                        render={({field}) => (
                            <FormItem className="col-span-1 ">
                                <FormControl>
                                    <Select
                                        onValueChange={(value) => {
                                            form.setValue("unidade_id", value);
                                        }}
                                    >
                                        <SelectTrigger Icon={Factory} className="h-10 w-full ">
                                            <SelectValue placeholder={userInformation.unidade} {...field} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {unidades.map((unidade) => (
                                                <SelectItem key={unidade.id} value={unidade.id!.toString()}>
                                                    {unidade.nome}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    )
                    }
                    </form>
                </Form>
                <DialogFooter>
                    <SubmitButton isLoading={isPending} form="edit-user-form" />
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
export default EditUserModal;
