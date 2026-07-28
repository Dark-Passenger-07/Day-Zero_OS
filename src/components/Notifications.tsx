import { useCallback, useEffect, useState } from 'react'
import { Bell, CheckCheck, Search, Trash2 } from 'lucide-react'
import { LoadingState } from '@/components/feedback/LoadingState'
import {
  deleteNotification,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type NotificationItem,
} from '@/features/notifications/services/notifications.service'

export default function Notifications() {
  const [items, setItems] = useState<NotificationItem[]>([])
  const [query, setQuery] = useState('')
  const [unreadOnly, setUnreadOnly] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setItems(await listNotifications(query, unreadOnly))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load notifications.')
    } finally {
      setLoading(false)
    }
  }, [query, unreadOnly])

  useEffect(() => {
    const timer = window.setTimeout(load, 150)
    return () => window.clearTimeout(timer)
  }, [load])

  async function act(action: () => Promise<void>, success: string) {
    try {
      await action()
      setMessage(success)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Notification action failed.')
    }
  }

  if (loading)
    return (
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <LoadingState label="Loading notifications" />
      </div>
    )

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-6 lg:p-9">
      <div className="flex flex-row justify-between items-start mb-6">
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 600, margin: '0 0 4px', letterSpacing: '-0.03em' }}>
            Notifications
          </h1>
          <p style={{ color: 'var(--muted-foreground)', fontSize: '13px', margin: 0 }}>
            {items.filter((item) => !item.readAt).length} unread
          </p>
        </div>
        <button
          onClick={() => act(markAllNotificationsRead, 'All notifications marked read.')}
          style={buttonStyle}
        >
          <CheckCheck size={13} /> Mark all read
        </button>
      </div>
      {error && <Notice color="var(--status-red)" text={error} />}
      {message && <Notice color="var(--status-green)" text={message} />}
      <div className="flex flex-row gap-2 mb-4 w-full">
        <div className="relative flex-1 sm:max-w-[320px]">
          <Search
            size={13}
            style={{
              position: 'absolute',
              left: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--muted-foreground)',
            }}
          />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search notifications..."
            style={{
              width: '100%',
              background: 'var(--secondary)',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              padding: '7px 12px 7px 30px',
              color: 'var(--foreground)',
              fontSize: '13px',
              outline: 'none',
              fontFamily: 'inherit',
            }}
          />
        </div>
        <button
          onClick={() => setUnreadOnly((value) => !value)}
          style={{
            ...buttonStyle,
            background: unreadOnly ? 'var(--card)' : 'var(--secondary)',
            flexShrink: 0,
          }}
        >
          Unread
        </button>
      </div>
      <div
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: '10px',
          overflow: 'hidden',
        }}
      >
        {items.length === 0 ? (
          <div
            style={{
              padding: '48px',
              textAlign: 'center',
              color: 'var(--muted-foreground)',
              fontSize: '14px',
            }}
          >
            No notifications.
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              style={{
                display: 'flex',
                gap: '12px',
                padding: '14px 18px',
                borderBottom: '1px solid var(--border)',
                background: item.readAt ? 'transparent' : 'rgba(59,130,246,0.06)',
              }}
            >
              <Bell size={15} color={item.readAt ? 'var(--muted-foreground)' : 'var(--status-blue)'} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: 500 }}>{item.title}</div>
                {item.body && (
                  <div style={{ fontSize: '12px', color: 'var(--muted-foreground)', marginTop: '3px' }}>
                    {item.body}
                  </div>
                )}
                <div style={{ fontSize: '11px', color: 'var(--muted-foreground)', marginTop: '5px' }}>
                  {item.type} · {new Date(item.createdAt).toLocaleString()}
                </div>
              </div>
              {!item.readAt && (
                <button
                  onClick={() => act(() => markNotificationRead(item.id), 'Notification marked read.')}
                  style={iconStyle}
                >
                  <CheckCheck size={13} />
                </button>
              )}
              <button
                onClick={() => act(() => deleteNotification(item.id), 'Notification deleted.')}
                style={iconStyle}
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

const buttonStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  background: 'var(--secondary)',
  border: '1px solid var(--border)',
  borderRadius: '6px',
  padding: '7px 12px',
  color: 'var(--secondary-foreground)',
  fontSize: '12px',
  cursor: 'pointer',
  fontFamily: 'inherit',
}
const iconStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: 'var(--muted-foreground)',
  cursor: 'pointer',
  padding: '4px',
  display: 'flex',
}

function Notice({ color, text }: { color: string; text: string }) {
  return (
    <div
      style={{
        border: `1px solid ${color}`,
        color,
        borderRadius: '8px',
        padding: '10px 12px',
        fontSize: '13px',
        marginBottom: '16px',
      }}
    >
      {text}
    </div>
  )
}
