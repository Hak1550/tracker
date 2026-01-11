import {StyleSheet} from 'react-native';
import { scale, verticalScale } from '../../utils/responsive';
import { Colors } from '../../utils/colors';

export default StyleSheet.create({
  mainContainerView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIconContainer: {
    height: 20,
    width: 20,
    borderRadius: 20 / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    position: 'absolute',
    top: 5,
    right: 5,
  },
  okContainer: {
    height: 20,
    width: 20,
    borderRadius: 20 / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    position: 'absolute',
    top: 5,
    right: 5,
  },
  closeIcon: {
    height: 8,
    width: 8,
    resizeMode: 'contain',
    tintColor: Colors.white,
  },
  smallButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
    width: '30%',
    // height: 20,
    // paddingTop: 5,
  },
  btnStyle: {
    width: '80%',
    backgroundColor: Colors.primary,
    elevation: 5,
    height: verticalScale(45),
  },
  mainBlurViewContiner: opacity => ({
    height: '100%',
    width: '100%',
    position: 'absolute',
    backgroundColor: Colors.modalBackground,
    opacity: opacity ?? 0.8,
  }),

  miniContainerView: {
    backgroundColor: Colors.white,
    width: '85%',
    // height: 35 * vh,
    borderRadius: 8,
    paddingBottom: 20,
  },

  crossIconStyle: {
    resizeMode: 'contain',
    height: 10,
    width: 10,
  },

  warningIconView: {
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },

  warningIconStyle: {
    resizeMode: 'contain',
    height: 50,
    width: 50,
    // tintColor: colors.primary
  },

  textStyle: {
    textAlign: 'center',
    fontSize: 10,
    color: Colors.blackColor,
    width: 300,
  },

  textDescriptionView: {
    width: '90%',
    alignSelf: 'center',
  },

  textButtonStyle: {
    width: 40,
  },
  okButton: {
    position: 'absolute',
    right: scale(20),
    bottom: verticalScale(10),
  },
  textButtonView: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2.5,
    marginBottom: 4,
  },

  crossButtonView: {alignItems: 'flex-end', width: 80, marginTop: 2},

  placeholderTextStyle: {
    // textAlign: 'center',
    color: Colors.blackColor,
    fontSize: 15,
    // marginTop: 30,
    // marginBottom: 20,
    paddingHorizontal: 10,
  },

  CustomButtonView: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  yesButtonStyle: {
    width: 70,
    height: 36,
    backgroundColor: Colors.primary,
    marginHorizontal: 10,
  },

  noButtonStyle: {
    width: 70,
    height: 36,
    marginHorizontal: 10,
  },

  buttonsViewStyle: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  noButtonTextStyle: {
    color: Colors.textColor,
  },
});
