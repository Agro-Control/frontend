"use client";

import * as React from "react";
import {format} from "date-fns";
import {ptBR} from "date-fns/locale";
import {cn} from "@/lib/utils";
import {Button} from "@/components/ui/button";
import {Calendar} from "@/components/ui/calendar";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {CalendarBlank} from "@phosphor-icons/react";

interface DatePickerProps {
    value: Date | undefined;
    onChange: (date: Date | undefined) => void;
  }
  
  export function DatePicker({ value, onChange }: DatePickerProps) {
    const [date, setDate] = React.useState<Date | undefined>(value);
  
    React.useEffect(() => {
      if (!date) return;
  
      const formattedDate = format(date, 'dd-MM-yyyy HH:mm:ss');
      console.log(formattedDate);
      onChange(date); // Atualiza o valor no componente pai, se necessário
    }, [date, onChange]);
  
    const handleDateChange = (newDate: Date | undefined) => {
      setDate(newDate);
    };
  
    return (
      <Popover>
        <PopoverTrigger className={cn("h-10 border-divider rounded-xl hover:bg-white")} asChild>
          <Button
            variant={"outline"}
            className={cn("w-full justify-start text-left font-normal", !date && "text-gray-500")}
          >
            <CalendarBlank className="-ml-1 mr-2 h-5 w-5 text-green-950" />
            {date ? format(date, "dd/MM/yyyy") : <span>Selecione a data</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 ">
          <Calendar
            disabled={(date) => date < new Date()}
            mode="single"
            locale={ptBR}
            selected={date}
            onSelect={handleDateChange}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    );
  }