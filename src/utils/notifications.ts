export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  if (Notification.permission === 'denied') return false
  const result = await Notification.requestPermission()
  return result === 'granted'
}

export function notifyBadAir(cityName: string, message: string) {
  if (!('Notification' in window)) return
  if (Notification.permission !== 'granted') return
  new Notification(`ClimaWatch — ${cityName}`, {
    body: message,
    icon: '/favicon.svg',
  })
}
