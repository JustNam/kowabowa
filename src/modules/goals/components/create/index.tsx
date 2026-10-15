"use client";

import { useState, type FormEvent } from "react";
import { Modal } from "@/atoms/modal";
import { Input } from "@/atoms/input";
import { Textarea } from "@/atoms/textarea";
import { Button } from "@/atoms/button";
import { GoalsApi } from "@/api/goals";
import type { IGoalCreateRequest, IGoalModel } from "@/interfaces/goal.model";
import { validateGoalForm } from "../../schema";
import { DateRangeField } from "../date-range-field";
import { format } from "date-fns";

interface GoalsCreateProps {
  open: boolean;
  onClose: () => void;
  onSaved: (saved: IGoalModel) => void;
  goal?: IGoalModel; // nếu có goal thì bật chế độ Edit
}

type FormErrors = Partial<Record<keyof IGoalCreateRequest, string>>;

const EMPTY: IGoalCreateRequest = {
  title: "",
  description: "",
  startDate: "",
  endDate: "",
};

// chuyển goal thành giá trị form
const toFormValues = (goal?: IGoalModel): IGoalCreateRequest =>
  goal
    ? {
        title: goal.title,
        description: goal.description ?? "",
        startDate: goal.startDate,
        endDate: goal.endDate,
      }
    : { ...EMPTY, startDate: format(new Date(), "yyyy-MM-dd") };

export function GoalsCreate({
  open,
  onClose,
  onSaved,
  goal,
}: GoalsCreateProps) {
  const isEdit = !!goal;
  const [values, setValues] = useState<IGoalCreateRequest>(() =>
    toFormValues(goal),
  );
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Go vao field nao thi xoa loi field do
  const setField = (key: keyof IGoalCreateRequest, value: string) => {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const reset = () => {
    setValues(toFormValues(goal));
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
      const payload = { ...values, title: values.title.trim() };

      const { data: saved } = goal
        ? await GoalsApi.update(goal.id, payload)
        : await GoalsApi.create(payload);
      reset();
      onSaved(saved);
      onClose();
    } catch (err) {
      setServerError((err as Error).message); // loi mang, 401, 400 from BE
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={isEdit ? "Edit goal" : "Create goal"}
    >
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
        <DateRangeField
          startDate={values.startDate}
          endDate={values.endDate}
          onChange={(start, end) => {
            setField("startDate", start);
            setField("endDate", end);
          }}
          startError={errors.startDate}
          endError={errors.endDate}
        />
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
            {submitting ? "Saving..." : isEdit ? "Save changes" : "Create goal"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
