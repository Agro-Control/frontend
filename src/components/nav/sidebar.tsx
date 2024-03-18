"use client";
import NavButton from "./nav-button";
import SidebarHeader from "./sidebar-header";
import {
    ChartPieSlice,
    WindowsLogo,
    FileText,
    FilePdf,
    UsersThree,
    Truck,
    MapPin,
    Buildings,
    SignOut,
    GearSix,
} from "@phosphor-icons/react";

const Sidebar = () => {
    return (
        <div className="fixed left-0 top-0 flex h-screen w-[308px] flex-col justify-start gap-12 bg-sidebar py-6 drop-shadow-side">
            <SidebarHeader />
            <div className="flex w-full flex-col gap-3 px-2  ">
                <NavButton Icon={WindowsLogo} title="Painel de controle" />
                <NavButton Icon={ChartPieSlice} title="Dashboard" />
                <NavButton Icon={FileText} title="Ordens de serviço" />
                <NavButton Icon={FilePdf} title="Relatórios" />
                <NavButton Icon={UsersThree} title="Gestão de pessoas" />
                <NavButton Icon={Truck} title="Máquinas" />
                <NavButton Icon={MapPin} title="Talhões" />
                <NavButton Icon={Buildings} title="Gestão de empresas" />
            </div>
            <div className="mt-auto flex h-[14vh] w-full flex-col justify-end gap-3 self-end bg-transparent px-2">
                <div className="group flex h-[40px] w-full cursor-pointer flex-row items-center justify-start gap-3 rounded-xl px-6 transition-colors  hover:bg-divider ">
                    <GearSix className="h-6 w-6 text-green-950 " weight="fill" />
                    <p className="text-md font-jakarta font-medium text-green-950   ">Configuração</p>
                </div>
                <div className="group flex h-[40px] w-full cursor-pointer flex-row items-center justify-start gap-3 rounded-xl px-6 transition-colors  hover:bg-divider ">
                    <SignOut className="h-6 w-6 text-green-950  " weight="fill" />
                    <p className="text-md font-jakarta font-medium text-green-950 ">Sair</p>
                </div>
            </div>
        </div>
    );
};
export default Sidebar;
