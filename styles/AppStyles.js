import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    mainContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
    },
    authContainer: {
        width: '100%',
        maxWidth: 400,
        padding: 30,
        backgroundColor: '#fff',
        borderRadius: 10,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5
    },
    welcomeText: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 30,
        color: '#2c3e50'
    },
    userInfo: {
        alignItems: 'center',
        marginBottom: 20
    },
    userName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#34495e',
        marginBottom: 5
    },
    userEmail: {
        fontSize: 16,
        color: '#7f8c8d',
        marginBottom: 20
    },
    errorText: {
        color: '#dc3545',
        marginTop: 20,
        textAlign: 'center'
    }
});
