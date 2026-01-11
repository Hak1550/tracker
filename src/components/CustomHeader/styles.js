import { StyleSheet } from 'react-native';
import { Colors } from '../../utils/colors';

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.whiteThemeColor,
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    width: '100%',
    paddingHorizontal: 20,
    height: 65,
  },
  text: { fontSize: 20, color: Colors.blackColor, fontWeight: 'bold' },
  text2: { width: 20 },
  backImg: { width: 25, height: 15 },
  whatsappImg: { width: 20, height: 20 },
  bottomLine: {
    width: '60%',
    borderBottomWidth: 2,
    borderBottomColor: Colors.grayColor,
    position: 'absolute',
    bottom: 0,
    left: '27%',
    alignSelf: 'center',
  },
});
export default styles;
