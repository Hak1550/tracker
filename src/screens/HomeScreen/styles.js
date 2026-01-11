import { StyleSheet } from 'react-native';
import { Colors } from '../../utils/colors';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor:Colors.white
  },
  deviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.lightGrayColor,
  },
  deviceIcon: {
    marginRight: 12,
  },
  deviceName: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.blackColor,
    marginBottom: 4,
  },
  deviceDesc: {
    fontSize: 13,
    color: Colors.mediumGrayColor,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: Colors.blueThemeColor,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.blueThemeColor,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#00000066',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  input: {
    // borderWidth: 1,
    // borderColor: '#ddd',
    // borderRadius: 6,
    // paddingHorizontal: 10,
    // paddingVertical: 8,
    // marginBottom: 10,
    color:'#000'
  },
  deviceOptionsOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deviceOptionsContainer: {
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
  deviceOptionsHeader: {
    padding: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGrayColor,
    alignItems: 'center',
  },
  deviceOptionsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.blackColor,
    marginBottom: 4,
  },
  deviceOptionsSubtitle: {
    fontSize: 14,
    color: Colors.mediumGrayColor,
    marginTop: 4,
  },
  deviceOptionsContent: {
    padding: 16,
  },
  deviceOptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    backgroundColor: Colors.lightGrayColor,
  },
  deviceOptionButtonOpen: {
    backgroundColor: Colors.blueThemeColor,
  },
  deviceOptionButtonEdit: {
    backgroundColor: Colors.orangeThemeColor,
  },
  deviceOptionButtonDelete: {
    backgroundColor: Colors.dangerColor,
  },
  deviceOptionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
    marginLeft: 12,
    flex: 1,
  },
  deviceOptionButtonTextCancel: {
    color: Colors.darkGrayColor,
  },
  deviceOptionIcon: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deviceOptionIconText: {
    fontSize: 20,
  },
});
