import { cn } from "@/lib/utils";

/** A labelled input with its validation message from the API's `errors` map. */
export function Field({
  label,
  name,
  error,
  className,
  ...input
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string; name: string; error?: string }) {
  const errorId = error ? `${name}-error` : undefined;
  return (
    <label className={cn("block space-y-1.5", className)}>
      <span className="text-sm font-medium">{label}</span>
      <input name={name} className="input" aria-invalid={error ? true : undefined} aria-describedby={errorId} {...input} />
      {error && (
        <span id={errorId} className="block text-xs text-danger-fg">
          {error}
        </span>
      )}
    </label>
  );
}

type ControlProps = { label: string; name: string; error?: string; className?: string };

function Labelled({ label, name, error, className, children }: ControlProps & { children: React.ReactNode }) {
  return (
    <label className={cn("block space-y-1.5", className)}>
      <span className="text-sm font-medium">{label}</span>
      {children}
      {error && (
        <span id={`${name}-error`} className="block text-xs text-danger-fg">
          {error}
        </span>
      )}
    </label>
  );
}

/** A labelled select. Pass `placeholder` to offer an empty "not set" choice. */
export function SelectField({
  label,
  name,
  error,
  className,
  options,
  placeholder,
  ...select
}: React.SelectHTMLAttributes<HTMLSelectElement> &
  ControlProps & { options: Array<{ value: string; label: string }>; placeholder?: string }) {
  return (
    <Labelled label={label} name={name} error={error} className={className}>
      <select
        name={name}
        className="input"
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${name}-error` : undefined}
        {...select}
      >
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </Labelled>
  );
}

export function TextAreaField({
  label,
  name,
  error,
  className,
  ...textarea
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & ControlProps) {
  return (
    <Labelled label={label} name={name} error={error} className={className}>
      <textarea
        name={name}
        rows={3}
        className="input"
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${name}-error` : undefined}
        {...textarea}
      />
    </Labelled>
  );
}

export function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger-fg">
      {message}
    </p>
  );
}

export function SubmitButton({ pending, children, className }: { pending: boolean; children: React.ReactNode; className?: string }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        "rounded-lg bg-brand px-4 py-2 text-sm font-medium text-brand-fg hover:bg-brand-hover disabled:opacity-60",
        className,
      )}
    >
      {children}
    </button>
  );
}
