import React, { useState } from "react";
import { Autocomplete, TextField, CircularProgress, Chip } from "@mui/material";

interface MultiAutoCompleteEntitySelectProps<T> {
  value: T | T[] | null; // Valor atual (entidade ou entidades)
  onChange: (value: T | T[] | null) => void; // Callback para alterar o valor
  options: T[]; // Lista de opções
  label: string; // Rótulo do campo
  multiple?: boolean; // Permitir múltiplas seleções
  placeholder?: string; // Placeholder do campo
  getOptionLabel: (option: T) => string; // Função para determinar o rótulo das opções
  loading?: boolean; // Estado de carregamento
}

const MultiAutoCompleteEntitySelect = <T extends { id: number }>({
  value,
  onChange,
  options,
  label,
  multiple = false,
  placeholder = "Selecione",
  getOptionLabel,
  loading = false, // Recebe o estado de carregamento
}: MultiAutoCompleteEntitySelectProps<T>) => {
  const [selectedValue, setSelectedValue] = useState<T | T[] | null>(value);

  const handleChange = (event: React.SyntheticEvent<Element, Event>, newValue: T | T[] | null) => {
    setSelectedValue(newValue);
    onChange(newValue);
  };

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Autocomplete
      multiple={multiple}
      options={options}
      getOptionLabel={getOptionLabel}
      value={selectedValue}
      onChange={handleChange}
      renderInput={(params) => (
        <TextField {...params} label={label} placeholder={placeholder} />
      )}
    />
  );
};

export default MultiAutoCompleteEntitySelect;
