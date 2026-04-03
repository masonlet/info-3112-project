import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useFormFields } from "@/hooks/useFormFields";

describe("useFormFields", () => {
  const initial = { email: "", password: "" };
  const initialWithToggle = { email: "", showContactInfo: false };

  it("initializes with provided values", () => {
    const { result } = renderHook(() => useFormFields(initial));
    expect(result.current.formData).toEqual(initial);
    expect(result.current.errors).toEqual({});
  });

  it("updates field value on change", () => {
    const { result } = renderHook(() => useFormFields(initial));
    act(() => {
      result.current.handleChange({
        target: { name: "email", value: "test@example.com" },
      } as React.ChangeEvent<HTMLInputElement>);
    });
    expect(result.current.formData.email).toBe("test@example.com");
  });

  it("clears field error on change", () => {
    const { result } = renderHook(() => useFormFields(initial));
    act(() => result.current.setErrors({ email: "Required" }));
    act(() => {
      result.current.handleChange({
        target: { name: "email", value: "x" },
      } as React.ChangeEvent<HTMLInputElement>);
    });
    expect(result.current.errors.email).toBe("");
  });

  it("does not clear errors for other fields on change", () => {
    const { result } = renderHook(() => useFormFields(initial));
    act(() => result.current.setErrors({ 
      email: "Required", password: "Required" 
    }));
    act(() => {
      result.current.handleChange({
        target: { name: "email", value: "x" },
      } as React.ChangeEvent<HTMLInputElement>);
    });
    expect(result.current.errors.password).toBe("Required");
  });

  it("uses checkbox checked value for boolean fields", () => {
    const { result } = renderHook(() => useFormFields(initialWithToggle));

    act(() => {
      result.current.handleChange({
        target: {
          name: "showContactInfo",
          type: "checkbox",
          checked: true,
          value: "on",
        },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.formData.showContactInfo).toBe(true);
  });
});
