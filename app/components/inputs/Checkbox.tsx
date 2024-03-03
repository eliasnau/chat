import React, { useState } from "react";
import clsx from "clsx";
import { FieldErrors, FieldValues, UseFormRegister } from "react-hook-form";

interface CheckboxProps {
  label: string;
  id: string;
  required?: boolean;
  register: UseFormRegister<FieldValues>;
  errors: FieldErrors;
  disabled?: boolean;
  isChecked?: boolean;
}

const Checkbox: React.FC<CheckboxProps> = ({
  label,
  id,
  register,
  required,
  errors,
  disabled,
  isChecked: defaultChecked = false,
}) => {
  const [isChecked, setChecked] = useState(defaultChecked);

  const handleToggle = () => {
    setChecked((prevChecked) => !prevChecked);
  };

  return (
    <div>
      <div className="flex items-center">
        <input
          id={id}
          type="checkbox"
          {...register(id, { required })}
          checked={isChecked}
          onChange={handleToggle}
          disabled={disabled}
          className={clsx(`
            form-checkbox
            h-4
            w-4
            text-black 
            bg-white
            border-2   
            rounded    
            focus:ring-0
            ${errors[id] && "focus:ring-rose-500"}
            ${disabled && "opacity-50 cursor-default"}
          `)}
        />
        <label
          htmlFor={id}
          className={clsx(`
            ml-2
            block
            text-sm
            font-medium
            leading-5
            text-gray-900
          `)}
        >
          {label}
        </label>
      </div>
      {errors[id] && (
        <p className="mt-1 text-sm text-rose-500">{label} is required.</p>
      )}
    </div>
  );
};

export default Checkbox;
