import React from "react";
import { Autocomplete, TextField, Chip } from "@mui/material";

interface MultiAutoCompleteSelectProps {
  value: number | number[]; 
  onChange: (value: number | number[]) => void;
  options: { id: number; label: string }[];
  label: string;
  multiple?: boolean;
  placeholder?: string;
  getOptionLabel?: (option: { id: number; label: string }) => string;
  renderOption?: (
    props: React.HTMLAttributes<HTMLLIElement>,
    option: { id: number; label: string }
  ) => React.ReactNode; // Nova prop opcional
}

const MultiAutoCompleteSelect: React.FC<MultiAutoCompleteSelectProps> = ({
  value,
  onChange,
  options,
  label,
  multiple = false,
  placeholder = "Selecione",
  getOptionLabel = (option) => option.label,
  renderOption,
}) => {
  const handleChange = (event: any, newValue: any) => {
    if (multiple) {
      onChange(newValue.map((item: any) => item.id));
    } else {
      onChange(newValue?.id || null);
    }
  };

  return (
    <Autocomplete
      multiple={multiple}
      options={options}
      getOptionLabel={getOptionLabel}
      value={multiple
        ? options.filter((option) => (value as any[]).includes(option.id)) // Para múltiplos valores
        : options.find((option) => option.id === value) || null // Para único valor
      }
      defaultValue={options.find(option => option.id === value)}
      onChange={handleChange}
      renderInput={(params) => <TextField {...params} label={label} placeholder={placeholder} />}
      renderTags={(value, getTagProps) =>
        value.map((option: any, index: number) => (
          <Chip
            label={option.label}
            {...getTagProps({ index })}
            color="primary"
            key={option.id}
          />
        ))
      }
      renderOption={renderOption} 
    />
  );
};

export default MultiAutoCompleteSelect;
