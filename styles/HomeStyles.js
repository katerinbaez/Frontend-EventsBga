import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

const COLORS = {
    primary: '#000000',
    secondary: '#ffffff',
    accent: '#ff4757',
    text: '#ffffff',
    textDark: '#000000',
    overlay: 'rgba(0,0,0,0.5)',
};

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.primary,
    },
    header: {
        paddingTop: height * 0.05,
        paddingHorizontal: 20,
        paddingBottom: 15,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    titleContainer: {
        flex: 1,
    },
    headerText: {
        color: COLORS.text,
        fontSize: width * 0.08,
        fontWeight: '800',
        letterSpacing: 1,
    },
    subHeaderText: {
        color: COLORS.text,
        fontSize: width * 0.035,
        opacity: 0.7,
    },
    loginButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: COLORS.accent,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 25,
    },
    loginButtonText: {
        color: COLORS.accent,
        fontSize: 16,
        fontWeight: '600',
    },
    scrollContainer: {
        flex: 1,
    },
    categoryTitle: {
        color: COLORS.text,
        fontSize: width * 0.06,
        fontWeight: '700',
        marginLeft: 20,
        marginBottom: 15,
    },
    cardScroll: {
        height: height * 0.7,
    },
    card: {
        width: width * 0.9,
        height: height * 0.65,
        marginLeft: 20,
        marginRight: 10,
        borderRadius: 20,
        overflow: 'hidden',
        backgroundColor: COLORS.secondary,
    },
    cardImage: {
        width: '100%',
        height: '100%',
    },
    cardOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'flex-end',
        padding: 20,
    },
    cardTitle: {
        color: COLORS.text,
        fontSize: width * 0.07,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    cardType: {
        color: COLORS.accent,
        fontSize: width * 0.04,
        fontWeight: '600',
        marginBottom: 4,
    },
    cardDescription: {
        color: COLORS.text,
        fontSize: width * 0.035,
        opacity: 0.9,
    },
    modalView: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: COLORS.primary,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        padding: 20,
        paddingTop: 15,
        maxHeight: height * 0.9,
    },
    indicator: {
        width: 40,
        height: 4,
        backgroundColor: COLORS.text,
        opacity: 0.3,
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        color: COLORS.text,
        fontSize: width * 0.07,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    modalDescription: {
        color: COLORS.text,
        fontSize: width * 0.04,
        opacity: 0.8,
        lineHeight: 24,
    },
    closeButton: {
        backgroundColor: COLORS.accent,
        padding: 15,
        borderRadius: 15,
        alignItems: 'center',
        marginTop: 20,
    },
    closeButtonText: {
        color: COLORS.text,
        fontSize: 16,
        fontWeight: '600',
    },
});
