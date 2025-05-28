import { StyleSheet } from 'react-native';
import { COLORS } from '../../../../styles/theme';

export const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
    },
    button: {
        minWidth: 200,
    },
    errorContainer: {
        marginTop: 10,
        padding: 10,
        backgroundColor: '#ffeeee',
        borderRadius: 5,
        maxWidth: '90%',
    },
    errorText: {
        color: COLORS.primary || '#FF3A5E',
        textAlign: 'center',
    },
    loadingContainer: {
        marginTop: 20,
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        color: '#666',
        textAlign: 'center',
    },
});
