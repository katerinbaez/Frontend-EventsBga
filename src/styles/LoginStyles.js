import { StyleSheet } from 'react-native';
;

export const styles = StyleSheet.create({
    container: {
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#ffffff',
        textAlign: 'center'
    },
    input: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
        color: '#ffffff',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)'
    },
    button: {
        backgroundColor: '#ff4757',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 10
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600'
    },
    socialButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 15,
        borderRadius: 10,
        marginVertical: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)'
    },
    socialButtonText: {
        color: '#ffffff',
        marginLeft: 10,
        fontSize: 16
    },
    userEmail: {
        fontSize: 16,
        color: '#ffffff',
        opacity: 0.7,
        marginBottom: 20,
        textAlign: 'center'
    },
    errorText: {
        color: '#ff4757',
        marginTop: 20,
        textAlign: 'center'
    }
});
