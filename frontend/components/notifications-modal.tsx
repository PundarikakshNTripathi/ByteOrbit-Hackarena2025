'use client'

import { X, CheckCircle, AlertCircle, Info, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface NotificationsModalProps {
  isOpen: boolean
  onClose: () => void
}

const dummyNotifications = [
  {
    id: 1,
    type: 'success',
    title: 'Complaint Resolved',
    message: 'Your complaint #1234 has been marked as resolved.',
    time: '2 hours ago',
  },
  {
    id: 2,
    type: 'info',
    title: 'Status Update',
    message: 'Complaint #5678 is now in progress.',
    time: '5 hours ago',
  },
  {
    id: 3,
    type: 'warning',
    title: 'Action Required',
    message: 'Please provide additional information for complaint #9012.',
    time: '1 day ago',
  },
  {
    id: 4,
    type: 'info',
    title: 'New Feature',
    message: 'Check out our new public monitoring dashboard!',
    time: '2 days ago',
  },
  {
    id: 5,
    type: 'success',
    title: 'Complaint Submitted',
    message: 'Your complaint has been successfully submitted.',
    time: '3 days ago',
  },
]

export function NotificationsModal({ isOpen, onClose }: NotificationsModalProps) {
  if (!isOpen) return null

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-orange-500" />
      case 'info':
      default:
        return <Info className="h-5 w-5 text-blue-500" />
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end pt-16 pr-4" onClick={onClose}>
      <div className="bg-background rounded-lg shadow-xl w-full max-w-md max-h-[600px] overflow-hidden border" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Notifications</h2>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="text-xs">
              Mark all as read
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(600px - 64px)' }}>
          {dummyNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <Bell className="h-12 w-12 text-muted-foreground mb-2" />
              <p className="text-muted-foreground">No notifications</p>
            </div>
          ) : (
            <div className="divide-y">
              {dummyNotifications.map((notification) => (
                <div key={notification.id} className="p-4 hover:bg-muted/50 cursor-pointer transition-colors">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{notification.title}</p>
                      <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
