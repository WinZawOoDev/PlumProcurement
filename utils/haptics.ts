import { Vibration } from 'react-native'

export function lightHaptic(): void {
    try {
        Vibration.vibrate(10)
    } catch {
        // Vibration not available/permitted on this device — ignore
    }
}
