import { useClerk } from '@clerk/clerk-expo'
import * as Linking from 'expo-linking'
import { Text, TouchableOpacity } from 'react-native'

export const SignOutButton = () => {
    const { signOut } = useClerk()

    const handleSignOut = async () => {
        try {
            await signOut()
            Linking.openURL(Linking.createURL('/'))
        } catch (err) {
            console.error(JSON.stringify(err, null, 2))
        }
    }

    return (
        <TouchableOpacity
            onPress={handleSignOut}
            style={{ backgroundColor: '#000', padding: 10, borderRadius: 5 }}
        >
            <Text style={{ color: '#fff', textAlign: 'center' }}>Sign out</Text>
        </TouchableOpacity>
    )
} 