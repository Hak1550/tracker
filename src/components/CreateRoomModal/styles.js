import { StyleSheet } from 'react-native';
import { Colors } from '../../utils/colors';

export const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#00000066',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '90%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    maxHeight: '90%',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: Colors.blackColor,
  },
  input: {
    color: Colors.blackColor,
  },
  imageContainer: {
    marginBottom: 16,
  },
  imageLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: Colors.blackColor,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 8,
  },
  removeImageButton: {
    padding: 8,
    backgroundColor: Colors.dangerColor,
    borderRadius: 6,
    alignItems: 'center',
  },
  removeImageText: {
    color: Colors.white,
    fontWeight: '600',
  },
  imagePickerButton: {
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.grayColor,
    borderRadius: 8,
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  imagePickerText: {
    color: Colors.mediumGrayColor,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  bottomSheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheetContainer: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 12,
    paddingBottom: 32,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  bottomSheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.grayColor,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  bottomSheetTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.blackColor,
    marginBottom: 20,
    textAlign: 'center',
  },
  bottomSheetOption: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: Colors.lightGrayColor,
    marginBottom: 12,
    alignItems: 'center',
  },
  bottomSheetOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.blackColor,
  },
  bottomSheetCancel: {
    backgroundColor: Colors.lightGrayColor,
    marginTop: 8,
  },
  bottomSheetCancelText: {
    color: Colors.darkGrayColor,
  },
});

