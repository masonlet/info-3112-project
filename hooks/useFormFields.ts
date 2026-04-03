import { useState } from "react";

type FormElement = HTMLInputElement | HTMLSelectElement;
type FormValue = string | boolean;

export function useFormFields<T extends Record<string, FormValue>>(initial: T) {
  const [formData, setFormData] = useState<T>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<FormElement>) => {
    const { name } = e.target;
    const target = e.target as HTMLInputElement | HTMLSelectElement;
    const nextValue: FormValue =
      target.type === "checkbox" && "checked" in target
        ? target.checked
        : target.value;

    setFormData((prev) => ({ ...prev, [name]: nextValue as T[keyof T] }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  return { formData, setFormData, errors, setErrors, handleChange };
}
