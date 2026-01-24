"use client";

import * as React from "react";
import * as RPNInput from "react-phone-number-input";
import flags from "react-phone-number-input/flags";
import "react-phone-number-input/style.css";

import { Input, InputProps } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type PhoneInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "onChange" | "value"
> &
  Omit<RPNInput.Props<typeof RPNInput.default>, "onChange"> & {
    onChange?: (value: RPNInput.Value) => void;
  };

const PhoneInput: React.ForwardRefExoticComponent<PhoneInputProps> =
  React.forwardRef<React.ElementRef<typeof RPNInput.default>, PhoneInputProps>(
    ({ className, onChange, ...props }, ref) => {
      return (
        <RPNInput.default
          ref={ref}
          className={cn("flex", className)}
          flagComponent={FlagComponent}
          inputComponent={InputComponent}
          defaultCountry="AU"
          international
          countryCallingCodeEditable={false}
          onChange={(value) => onChange?.(value || ("" as RPNInput.Value))}
          {...props}
        />
      );
    }
  );
PhoneInput.displayName = "PhoneInput";

const InputComponent = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => (
    <Input
      className={cn(
        "rounded-e-lg rounded-s-none bg-transparent border-gray-600",
        className
      )}
      {...props}
      ref={ref}
    />
  )
);
InputComponent.displayName = "InputComponent";

const FlagComponent = ({ country, countryName }: RPNInput.FlagProps) => {
  const Flag = country ? flags[country] : null;

  return (
    <span className="flex h-4 w-6 overflow-hidden rounded-sm bg-gray-700">
      {Flag && <Flag title={countryName} />}
    </span>
  );
};
FlagComponent.displayName = "FlagComponent";

export { PhoneInput };
