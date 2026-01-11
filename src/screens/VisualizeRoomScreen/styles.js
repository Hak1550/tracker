import { StyleSheet, Dimensions } from 'react-native';
import { Colors } from '../../utils/colors';

const { width: WIDTH, height: HEIGHT } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  visualizationContainer: {
    flex: 1,
    position: 'relative',
    backgroundColor: Colors.lightGrayColor,
  },
  roomBackground: {
    position: 'absolute',
    borderRadius: 0,
    overflow: 'hidden',
  },
  roomBackgroundImage: {
    opacity: 0.4,
  },
  roomOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  axisLine: {
    position: 'absolute',
    backgroundColor: Colors.mediumGrayColor,
    opacity: 0.3,
  },
  xAxis: {
    height: 1,
    width: '100%',
  },
  yAxis: {
    width: 1,
    height: '100%',
  },
  dot: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.white,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 5,
  },
  anchor: {
    backgroundColor: Colors.blackColor,
    borderColor: Colors.white,
  },
  tag: {
    backgroundColor: Colors.dangerColor,
    borderColor: Colors.white,
  },
  anchorLabel: {
    position: 'absolute',
    fontSize: 11,
    color: Colors.blackColor,
    fontWeight: '700',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    minWidth: 80,
    textAlign: 'center',
  },
  tagLabel: {
    position: 'absolute',
    fontSize: 11,
    color: Colors.dangerColor,
    fontWeight: '700',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    minWidth: 90,
    textAlign: 'center',
  },
  infoContainer: {
    padding: 16,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.lightGrayColor,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  infoText: {
    fontSize: 14,
    color: Colors.blackColor,
    fontWeight: '600',
    marginBottom: 4,
  },
  infoMessage: {
    fontSize: 12,
    color: Colors.mediumGrayColor,
    fontStyle: 'italic',
  },
});

