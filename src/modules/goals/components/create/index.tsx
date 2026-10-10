"use client";

import { useState, type FormEvent } from "react";
import { format, parseISO } from "date-fns";
import { Modal } from "@/atoms/modal";
import { Input } from "@/atoms/input";
import { Textarea } from "@/atoms/textarea";
import { Button } from "@/atoms/button";
import { DatePicker } from "@/atoms/date-picker";
import { GoalsApi } from "@/api/goals";
import type { IGoalCreateRequest } from "@/interfaces/goal.model";
import { validateGoalForm } from "../../schema";

interface GoalsCreateProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

// TODO: build the Create Goal form, rendered inside the Modal below.
// - Fields: title, description (optional), startDate, endDate. Validate
//   with `validateGoalForm` from '../../schema' (already requires
//   title, startDate, endDate, and end >= start).
// - On submit, call `GoalsApi.create(values)` from '@/api/goals', then
//   `onCreated()` and `onClose()`.
// - Reuse the Input/Textarea/Button atoms.

type FormErrors = Partial<Record<keyof IGoalCreateRequest, string>>;

const EMPTY: IGoalCreateRequest = {
  title: "",
  description: "",
  startDate: "",
  endDate: "",
};

// DataPicker lam viec voi Date, BE can chuoi 'YYYY-MM-DD' -> 2 ham doi qua lai
const toDate = (s: string) => (s ? parseISO(s) : null);
const toStr = (d: Date | null) =>
  d && !isNaN(d.getTime()) ? format(d, "yyyy-MM-dd") : "";

export function GoalsCreate({ open, onClose, onCreated }: GoalsCreateProps) {
  const [values, setValues] = useState<IGoalCreateRequest>(EMPTY);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Go vao field nao thi xoa loi field do
  const setField = (key: keyof IGoalCreateRequest, value: string) => {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const reset = () => {
    setValues(EMPTY);
    setErrors({});
    setServerError(null);
  };

  const handleClose = () => {
    if (submitting) return; // dang luu thi khong cho dong
    reset();
    onClose();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const found = validateGoalForm(values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    setServerError(null);
    try {
      await GoalsApi.create({ ...values, title: values.title.trim() });
      reset();
      onCreated();
      onClose();
    } catch (err) {
      setServerError((err as Error).message); // loi mang, 401, 400 from BE
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={handleClose} title="Create goal">
      <form
        onSubmit={handleSubmit}
        noValidate
        className="flex flex-col pt-2 gap-4"
      >
        <Input
          label="Title"
          value={values.title}
          onChange={(e) => setField("title", e.target.value)}
          error={!!errors.title}
          helperText={errors.title}
          required
          autoFocus
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <DatePicker
            label="Start Date"
            value={toDate(values.startDate)}
            onChange={(d) => setField("startDate", toStr(d as Date | null))}
            slotProps={{
              textField: {
                size: "small",
                fullWidth: true,
                required: true,
                error: !!errors.startDate,
                helperText: errors.startDate,
              },
            }}
          />
          <DatePicker
            label="End date"
            value={toDate(values.endDate)}
            onChange={(d) => setField("endDate", toStr(d as Date | null))}
            minDate={toDate(values.startDate) ?? undefined}
            slotProps={{
              textField: {
                size: "small",
                fullWidth: true,
                required: true,
                error: !!errors.endDate,
                helperText: errors.endDate,
              },
            }}
          />
        </div>
        <Textarea
          label="Description (optional)"
          value={values.description}
          onChange={(e) => setField("description", e.target.value)}
          error={!!errors.description}
          helperText={errors.description}
        />
        {serverError && (
          <p role="alert" className="text-sm text-red-600">
            {serverError}
          </p>
        )}
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            type="button"
            onClick={handleClose}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Saving..." : "Create goal"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
