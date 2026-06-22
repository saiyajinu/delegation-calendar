"use client";

import { useEffect, useState, useTransition } from "react";
import { Plus, Trash2, X } from "lucide-react";
import {
  addLocationFieldAction,
  deleteLocationAction,
  deleteLocationFieldAction,
  updateLocationAction,
  updateLocationFieldAction,
} from "@/app/actions/locations";
import { Button } from "@/app/components/ui/Button";
import { FieldNameInput } from "@/app/components/forms/FieldNameInput";
import type { LocationDetails, LocationSummary } from "@/server/locations";

type LocationDetailsProps = {
  location: LocationDetails;
  open: boolean;
  onClose: () => void;
  onUpdated: (location: LocationSummary) => void;
  onDeleted: (id: string) => void;
};

const inputClassName =
  "w-full rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-base outline-none ring-rose-300 focus:border-rose-400 focus:ring-2 sm:text-sm";

export function LocationDetailsPanel({
  location,
  open,
  onClose,
  onUpdated,
  onDeleted,
}: LocationDetailsProps) {
  const [name, setName] = useState(location.name);
  const [fields, setFields] = useState(location.fields);
  const [error, setError] = useState<string | null>(null);
  const [showAddField, setShowAddField] = useState(false);
  const [newFieldName, setNewFieldName] = useState("");
  const [newFieldValue, setNewFieldValue] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setName(location.name);
    setFields(location.fields);
    setError(null);
    setShowAddField(false);
    setNewFieldName("");
    setNewFieldValue("");
  }, [location]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  function handleSaveName() {
    startTransition(async () => {
      const result = await updateLocationAction({ id: location.id, name });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      if (result.data) {
        onUpdated(result.data);
      }
      setError(null);
    });
  }

  function handleDeleteLocation() {
    if (!window.confirm(`Delete "${location.name}"? This cannot be undone.`)) {
      return;
    }

    startTransition(async () => {
      const result = await deleteLocationAction(location.id);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      onDeleted(location.id);
      onClose();
    });
  }

  function handleAddField(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    startTransition(async () => {
      const result = await addLocationFieldAction({
        locationId: location.id,
        fieldName: newFieldName,
        fieldValue: newFieldValue,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      if (result.data) {
        setFields((current) => [...current, result.data!]);
      }
      setNewFieldName("");
      setNewFieldValue("");
      setShowAddField(false);
      setError(null);
    });
  }

  function handleFieldBlur(
    fieldId: string,
    fieldName: string,
    fieldValue: string
  ) {
    const original = location.fields.find((field) => field.id === fieldId);
    if (
      original &&
      original.fieldName === fieldName.trim() &&
      (original.fieldValue ?? "") === fieldValue.trim()
    ) {
      return;
    }

    startTransition(async () => {
      const result = await updateLocationFieldAction({
        id: fieldId,
        fieldName,
        fieldValue,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      if (result.data) {
        setFields((current) =>
          current.map((field) => (field.id === fieldId ? result.data! : field))
        );
      }
      setError(null);
    });
  }

  function handleDeleteField(fieldId: string) {
    startTransition(async () => {
      const result = await deleteLocationFieldAction(fieldId);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setFields((current) => current.filter((field) => field.id !== fieldId));
      setError(null);
    });
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-stretch sm:justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-rose-950/25 backdrop-blur-[1px]"
        onClick={onClose}
        aria-label="Close details"
      />
      <aside className="relative flex max-h-[92vh] w-full flex-col rounded-t-3xl border border-rose-200 bg-white shadow-2xl shadow-rose-200/50 sm:h-full sm:max-h-none sm:max-w-lg sm:rounded-none sm:border-l sm:border-t-0">
        <div className="flex justify-center pt-3 sm:hidden">
          <div className="h-1.5 w-12 rounded-full bg-rose-200" />
        </div>
        <div className="flex items-center justify-between border-b border-rose-100 px-5 py-4">
          <h2 className="text-lg font-semibold text-rose-950">Location details</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-rose-400 transition-colors hover:bg-rose-50 hover:text-rose-700"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
          <div className="space-y-2">
            <label htmlFor="location-name" className="text-sm font-medium text-rose-900">
              Name *
            </label>
            <input
              id="location-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className={inputClassName}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-rose-700">
                Fields
              </h3>
              <button
                type="button"
                onClick={() => setShowAddField((current) => !current)}
                className="inline-flex min-h-11 items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-rose-700 transition-colors hover:bg-rose-50"
              >
                <Plus className="h-4 w-4" />
                Add Field
              </button>
            </div>

            {fields.length === 0 && !showAddField ? (
              <p className="rounded-xl border border-dashed border-rose-200 bg-rose-50/60 px-4 py-6 text-center text-sm text-rose-600">
                No custom fields yet. Tap &quot;Add Field&quot; to create one.
              </p>
            ) : (
              <div className="space-y-3">
                {fields.map((field) => (
                  <FieldRow
                    key={field.id}
                    field={field}
                    disabled={isPending}
                    onBlur={handleFieldBlur}
                    onDelete={handleDeleteField}
                  />
                ))}
              </div>
            )}

            {showAddField && (
              <form onSubmit={handleAddField} className="space-y-3 rounded-2xl border border-rose-200 bg-rose-50/70 p-4">
                <div className="space-y-2">
                  <label htmlFor="new-field-name" className="text-sm font-medium text-rose-900">
                    Field name
                  </label>
                  <FieldNameInput
                    id="new-field-name"
                    value={newFieldName}
                    onChange={setNewFieldName}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="new-field-value" className="sr-only">
                    Value
                  </label>
                  <input
                    id="new-field-value"
                    value={newFieldValue}
                    onChange={(event) => setNewFieldValue(event.target.value)}
                    placeholder="Enter value…"
                    className={inputClassName}
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" isLoading={isPending} className="min-h-11 flex-1">
                    Save field
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    className="min-h-11"
                    onClick={() => setShowAddField(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

        <div className="flex gap-3 border-t border-rose-100 px-5 py-4">
          <Button
            onClick={handleSaveName}
            isLoading={isPending}
            className="min-h-11 flex-1"
          >
            Save
          </Button>
          <Button
            variant="secondary"
            onClick={handleDeleteLocation}
            isLoading={isPending}
            className="min-h-11 text-red-700 hover:bg-red-50"
          >
            Delete
          </Button>
        </div>
      </aside>
    </div>
  );
}

function FieldRow({
  field,
  disabled,
  onBlur,
  onDelete,
}: {
  field: LocationDetails["fields"][number];
  disabled: boolean;
  onBlur: (id: string, name: string, value: string) => void;
  onDelete: (id: string) => void;
}) {
  const [fieldName, setFieldName] = useState(field.fieldName);
  const [fieldValue, setFieldValue] = useState(field.fieldValue ?? "");

  useEffect(() => {
    setFieldName(field.fieldName);
    setFieldValue(field.fieldValue ?? "");
  }, [field]);

  return (
    <div className="rounded-2xl border border-rose-200 bg-white p-4 shadow-sm shadow-rose-100/60">
      <div className="mb-2 flex items-start justify-between gap-2">
        <FieldNameInput
          value={fieldName}
          onChange={setFieldName}
          onBlur={() => onBlur(field.id, fieldName, fieldValue)}
          disabled={disabled}
          variant="title"
          placeholder="Field name"
          className="flex-1"
        />
        <button
          type="button"
          disabled={disabled}
          onClick={() => onDelete(field.id)}
          className="shrink-0 rounded-lg p-2 text-rose-400 transition-colors hover:bg-rose-50 hover:text-red-600 disabled:opacity-50"
          aria-label="Delete field"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      <input
        value={fieldValue}
        onChange={(event) => setFieldValue(event.target.value)}
        onBlur={() => onBlur(field.id, fieldName, fieldValue)}
        disabled={disabled}
        placeholder="Enter value…"
        aria-label={`${fieldName || "Field"} value`}
        className={inputClassName}
      />
    </div>
  );
}
