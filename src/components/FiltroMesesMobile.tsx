// src/components/FiltroMesesMobile.tsx

"use client";

import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Check, Calendar } from "lucide-react";

interface Props {
  meses: number[];
  selecionados: number[];
  onChange: (novos: number[]) => void;
}

export default function FiltroMesesMobile({ meses, selecionados, onChange }: Props) {
  const [open, setOpen] = useState(false);

  const toggleMes = (mes: number) => {
    if (selecionados.includes(mes)) {
      onChange(selecionados.filter(m => m !== mes));
    } else {
      onChange([...selecionados, mes]);
    }
  };

  return (
    <div className="md:hidden mb-4">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-between">
            <span>Selecionar meses</span>
            <Calendar className="h-4 w-4 opacity-70" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-2">
          <Command>
            <CommandInput placeholder="Buscar mês..." />
            <CommandList className="max-h-[250px] overflow-y-auto">
              <div className="grid grid-cols-2 gap-0.5">
                {meses.map(mes => (
                  <CommandItem
                    key={mes}
                    onSelect={() => toggleMes(mes)}
                    className="flex items-center gap-2 justify-start py-1 px-2"
                  >
                    <Checkbox
                      checked={selecionados.includes(mes)}
                      onCheckedChange={() => toggleMes(mes)}
                      className="mr-1"
                    />
                    <span className="text-sm">Mês {mes}</span>
                    {selecionados.includes(mes) && (
                      <Check className="ml-auto h-3 w-3 text-green-500" />
                    )}
                  </CommandItem>
                ))}
              </div>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
