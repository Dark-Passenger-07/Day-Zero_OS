import { useCallback, useState } from 'react'

export type FormField = {
  name: string
  label: string
  type?: 'text' | 'textarea' | 'number' | 'date' | 'select'
  value?: string
  options?: string[]
  required?: boolean
}

type DialogRequest = {
  title: string
  description?: string
  confirmLabel?: string
  destructive?: boolean
  fields?: FormField[]
}

type DialogState = DialogRequest & {
  values: Record<string, string>
  resolve: (value: Record<string, string> | null) => void
}

export function useFormDialog() {
  const [dialog, setDialog] = useState<DialogState | null>(null)

  const openForm = useCallback((request: DialogRequest) => {
    return new Promise<Record<string, string> | null>((resolve) => {
      setDialog({
        ...request,
        values: Object.fromEntries((request.fields ?? []).map((field) => [field.name, field.value ?? ''])),
        resolve,
      })
    })
  }, [])

  const close = (value: Record<string, string> | null) => {
    dialog?.resolve(value)
    setDialog(null)
  }

  const node = dialog ? (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={dialog.title}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 60,
        background: 'rgba(0,0,0,0.55)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <form
        onSubmit={(event) => {
          event.preventDefault()
          close(dialog.values)
        }}
        style={{
          width: 'min(620px, 100%)',
          maxHeight: '86vh',
          overflowY: 'auto',
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: '10px',
          padding: '22px',
        }}
      >
        <div style={{ fontSize: '18px', fontWeight: 600, marginBottom: '4px' }}>{dialog.title}</div>
        {dialog.description && (
          <div style={{ fontSize: '13px', color: 'var(--muted-foreground)', marginBottom: '18px' }}>
            {dialog.description}
          </div>
        )}
        <div style={{ display: 'grid', gap: '12px' }}>
          {(dialog.fields ?? []).map((field) => (
            <label key={field.name} style={{ display: 'grid', gap: '6px' }}>
              <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--secondary-foreground)' }}>
                {field.label}
              </span>
              {field.type === 'textarea' ? (
                <textarea
                  required={field.required}
                  value={dialog.values[field.name] ?? ''}
                  onChange={(event) =>
                    setDialog((current) =>
                      current
                        ? { ...current, values: { ...current.values, [field.name]: event.target.value } }
                        : current,
                    )
                  }
                  rows={4}
                  style={inputStyle}
                />
              ) : field.type === 'select' ? (
                <select
                  required={field.required}
                  value={dialog.values[field.name] ?? ''}
                  onChange={(event) =>
                    setDialog((current) =>
                      current
                        ? { ...current, values: { ...current.values, [field.name]: event.target.value } }
                        : current,
                    )
                  }
                  style={inputStyle}
                >
                  {(field.options ?? []).map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  required={field.required}
                  type={field.type ?? 'text'}
                  value={dialog.values[field.name] ?? ''}
                  onChange={(event) =>
                    setDialog((current) =>
                      current
                        ? { ...current, values: { ...current.values, [field.name]: event.target.value } }
                        : current,
                    )
                  }
                  style={inputStyle}
                />
              )}
            </label>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
          <button type="button" onClick={() => close(null)} style={buttonStyle}>
            Cancel
          </button>
          <button
            type="submit"
            style={{
              ...buttonStyle,
              background: dialog.destructive ? 'var(--status-red)' : 'var(--foreground)',
              color: dialog.destructive ? '#fff' : 'var(--background)',
            }}
          >
            {dialog.confirmLabel ?? 'Save'}
          </button>
        </div>
      </form>
    </div>
  ) : null

  return { openForm, FormDialog: node }
}

const inputStyle: React.CSSProperties = {
  background: 'var(--secondary)',
  border: '1px solid var(--border)',
  borderRadius: '6px',
  padding: '8px 10px',
  color: 'var(--foreground)',
  fontSize: '13px',
  outline: 'none',
  fontFamily: 'inherit',
  resize: 'vertical',
}
const buttonStyle: React.CSSProperties = {
  background: 'var(--secondary)',
  border: '1px solid var(--border)',
  borderRadius: '6px',
  padding: '8px 14px',
  color: 'var(--secondary-foreground)',
  fontSize: '13px',
  cursor: 'pointer',
  fontFamily: 'inherit',
}
