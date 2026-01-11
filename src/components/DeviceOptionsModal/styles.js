import { StyleSheet } from 'react-native';
import { Colors } from '../../utils/colors';

export const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 0,
    width: '85%',
    maxWidth: 320,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
    overflow: 'hidden',
  },
  header: {
    padding: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGrayColor,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.blackColor,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.mediumGrayColor,
    marginTop: 4,
  },
  content: {
    padding: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    backgroundColor: Colors.lightGrayColor,
  },
  buttonOpen: {
    backgroundColor: Colors.primary,
  },
  buttonCreateRoom: {
    backgroundColor: '#4CAF50',
  },
  buttonEdit: {
    backgroundColor: '#2196F3',
  },
  buttonDelete: {
    backgroundColor: '#F44336',
  },
  buttonCancel: {
    backgroundColor: Colors.lightGrayColor,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
    textAlign: 'center',
  },
  buttonTextCancel: {
    color: Colors.darkGrayColor,
  },
});

