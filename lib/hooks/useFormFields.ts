import { useState } from "react";

export function useFormFields<T extends Record<string, string>>(initial: T) {
  const [formData, setFormData] = useState<T>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  return { formData, setFormData, errors, setErrors, handleChange };
}
