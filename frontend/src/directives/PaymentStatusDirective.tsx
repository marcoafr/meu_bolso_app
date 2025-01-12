import React from "react";
import MultiAutoCompleteSelect from "./MultiAutoCompleteSelect";

interface PaymentStatusDirectiveProps {
  value: number | number[]; // Valor único ou múltiplo
  onChange: (value: number | number[]) => void;
  multiple?: boolean; // Se a seleção pode ser múltipla ou não
}

const PaymentStatusDirective: React.FC<PaymentStatusDirectiveProps> = ({
  value,
  onChange,
  multiple = false,
}) => {
  const statusOptions = [
    { id: 0, label: "Pendente" },
    { id: 1, label: "Pago" },
    { id: 3, label: "Cancelado" },
  ];

  return (
    <MultiAutoCompleteSelect
      label="Status"
      options={statusOptions}
      value={value}
      onChange={onChange}
      multiple={multiple}
      placeholder="Selecione o status"
    />
  );
};

export default PaymentStatusDirective;
