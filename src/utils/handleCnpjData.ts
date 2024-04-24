import {createCompanySchema} from "@/utils/validations/createCompanySchema";
import { UseFormSetValue } from "react-hook-form";
import { TFunction } from "i18next";
import axios from "axios";
import { z } from "zod";



interface Data {
    nome_fantasia: string | null;
    tipo_logradouro: string;
    logradouro: string;
    numero: string;
    complemento: string | null;
    bairro: string;
    cep: string;
    ddd1: string;
    telefone1: string;
    estado: {
        sigla: string;
    };
    cidade: {
        nome: string;
    };
}

interface Response {
    data: {
        estabelecimento: Data;
    };
}

type Form = z.infer<typeof createCompanySchema>;

type FormFields = keyof Omit<Form, "cnpj" | "telefoneResponsavel" | "emailResponsavel" | "nomeResponsavel">;

type HandledFormFields = {
    [key in FormFields]: string;
};

const mapDataToFormFields = (data: Data): HandledFormFields => ({
    nome: data.nome_fantasia || "",
    telefone: `(${data.ddd1}) ${data.telefone1.substring(0, 5)}-${data.telefone1.substring(5)}`,
    CEP: data.cep.substring(0, 5) + "-" + data.cep.substring(5), 
    estado: data.estado.sigla,
    cidade: data.cidade.nome,
    bairro: data.bairro,
    logradouro: `${data.tipo_logradouro} ${data.logradouro}`,
    numero: data.numero,
    complemento: data.complemento || "",
});

export const handleCnpjData = async (
    cnpj: string,
    setValue: UseFormSetValue<Form>,
) => {
    // const { toast } = createStandaloneToast();

    try {
        const response: Response = await axios.get(`https://publica.cnpj.ws/cnpj/${cnpj}`, {
            timeout: 5000, // 5s
        });

        const formFields = mapDataToFormFields(response.data.estabelecimento);

        Object.keys(formFields).forEach((key) => {
            setValue(key as FormFields, formFields[key as FormFields]);
        });

        return { success: true };
    } catch (error) {
        const toastId = "cnpj-error";

        // if (toast.isActive(toastId)) return;

        // toast({
        //     id: toastId,
        //     position: "top",
        //     title: translate("cnpj_failed"),
        //     description: translate("cnpj_failed_description"),
        //     status: "warning",
        //     duration: 9999,
        //     isClosable: true,
        //     variant: "left-accent",
        // });

        return { error: true };
    } 
};