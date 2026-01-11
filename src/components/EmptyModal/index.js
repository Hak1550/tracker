import React from 'react';
import { View, Modal, TouchableOpacity, Text } from 'react-native';

import styles from './styles';
import SmartImage from '../../components/SmartImage';
import { scale } from '../../utils/responsive';
import CustomText from '../../components/Text';
import { images } from '../../assets/images/images';
import CustomButton from '../CustomButton';

const EmptyModal = (props) => {
  const handleHide = () => {
    props?.onHide();
    if (props?.hidePress) {
      props?.hidePress();
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={props?.visible}
      style={{ flex: 1 }}
      onRequestClose={props?.onRequestClose || handleHide}
    >
      <View style={styles.mainContainerView}>
        <TouchableOpacity
          onPress={handleHide}
          style={styles.mainBlurViewContiner(props?.opacity)}
        ></TouchableOpacity>
        <View style={[styles.miniContainerView, props?.style]}>
          {!props.noHeader && (
            <>
              <View style={[styles.warningIconView]}>
                {props.image ? (
                  <SmartImage
                    source={props.image}
                    style={{ height: scale(100), width: scale(100) }}
                  />
                ) : (
                  <SmartImage
                    source={images.tickGif}
                    style={{ height: scale(100), width: scale(100) }}
                  />
                )}
              </View>
              {props.heading ? (
                <CustomText
                  text={props.heading}
                  style={{
                    fontWeight: '800',
                    textAlign: 'center',
                  }}
                />
              ) : (
                <></>
              )}
            </>
          )}

          <View style={styles.textDescriptionView}>
            {props?.placeholder && (
              <Text style={styles.placeholderTextStyle}>
                {props?.placeholder}
              </Text>
            )}
          </View>

          <View style={{ margin: 10 }}>{props?.children}</View>

          <CustomButton
            title={props.buttonText}
            onPress={props?.onPress ?? handleHide}
            loading={props?.loading}
            disabled={props?.loading || props?.disabled}
            style={{ width: '80%', alignSelf: 'center' }}
          />
        </View>
      </View>
    </Modal>
  );
};

export default EmptyModal;
