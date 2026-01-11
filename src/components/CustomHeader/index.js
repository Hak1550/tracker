import { Linking, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import styles from './styles';
import { images } from '../../assets/images/images';
import { Colors } from '../../utils/colors';
import SmartImage from '../../components/SmartImage/index';

const CustomHeader = ({
  title,
  back,
  navigation,
  support,
  onBack,
  image,
  rightImage,
  rightImagePress,
}) => {
  return (
    <View
      style={[
        styles.container,
        { backgroundColor: support ? '#dddddd' : Colors.white },
      ]}
    >
      {back ? (
        <TouchableOpacity
          onPress={onBack ? () => onBack() : () => navigation.goBack()}
        >
          <SmartImage source={images.back} style={styles.backImg} />
        </TouchableOpacity>
      ) : (
        <View style={styles.text2}></View>
      )}
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {image && (
          <SmartImage
            source={image}
            style={{ width: 40, height: 40, marginRight: 10 }}
          />
        )}
        <Text style={styles.text}>{title}</Text>
      </View>

      <View style={styles.text2}>
        {rightImage && (
          <TouchableOpacity
            activeOpacity={1}
            onPress={rightImagePress ? () => rightImagePress() : null}
          >
            <SmartImage
              source={rightImage}
              style={{ width: 40, height: 40, marginRight: 10 }}
            />
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.bottomLine}></View>
    </View>
  );
};

export default CustomHeader;
