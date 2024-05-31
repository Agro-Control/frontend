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
import {QueryObserverResult, RefetchOptions, useMutation, useQueryClient} from "@tanstack/react-query";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {User, EnvelopeSimple, IdentificationCard, Phone, SunHorizon} from "@phosphor-icons/react";
import {Form, FormControl, FormField, FormItem, FormMessage} from "@/components/ui/form";
import { editUserSchema } from "@/utils/validations/editUserSchema";
import {MaskedInput} from "@/components/ui/masked-input";
import formatPhone from "@/utils/functions/formatPhone";
import SubmitButton from "@/components/submit-button";
import {zodResolver} from "@hookform/resolvers/zod";
import formatCpf from "@/utils/functions/formatCpf";
import {useAuth} from "@/utils/hooks/useAuth";
import {InputMask} from "@react-input/mask";
import {Input} from "@/components/ui/input";
import {useForm} from "react-hook-form";
import Operador from "@/types/operador";
import {Gestor} from "@/types/gestor";
import {ReactNode, useState} from "react";
import {z} from "zod";
import GetOperador from "@/types/get-operador";
import GetGestor from "@/types/get-gestor";
import api from "@/lib/api";
import {useToast} from "../ui/use-toast";
import {AxiosError} from "axios";
import {useTranslation} from "react-i18next";
type Form = z.infer<typeof editUserSchema>;


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
    const whichRoleCreate = isAdmin ? "Gestor" : "Operador";
    const {t} = useTranslation();

    const form = useForm<Form>({
        resolver: zodResolver(editUserSchema),
        defaultValues: {
            nome: userInformation.nome,
            email: userInformation.email || "",
            cpf: formatCpf(userInformation.cpf),
            telefone: formatPhone(userInformation.telefone) || "",
            turno: userInformation.turno || "",
            status: userInformation.status,
        },
    });

    const editUserRequest = async (putData: Operador | Gestor | null) => {
        const url = isAdmin ? "/gestores" : "/operadores";
        const { data } = await api.put(url, putData);
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

            const {status} = response;
            const titleCode = `put${whichRoleCreate}-error-${status}`;
            const descriptionCode = `put${whichRoleCreate}-description-error-${status}`;

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
            nome: data.nome,
            email: data.email,
            turno: data.turno || "",
            status: data.status,
            cpf: data.cpf.replace(/\D/g, ""),
            telefone: data.telefone.replace(/\D/g, ""),
        }
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
                    <form onSubmit={form.handleSubmit(onSubmit)} id="edit-user-form" className="grid grid-cols-2 gap-4 py-4">
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

                      { !isAdmin &&  <FormField
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
                        />}
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
                                            <SelectTrigger Icon={SunHorizon} className="h-10 w-full ">
                                                <SelectValue placeholder="Status" {...field} />
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
