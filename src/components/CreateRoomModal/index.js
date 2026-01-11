import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { Colors } from '../../utils/colors';
import CustomInput from '../CustomInput';
import CustomButton from '../CustomButton';
import { styles } from './styles';

const CreateRoomModal = ({
  visible,
  onClose,
  roomData,
  onRoomDataChange,
  onSubmit,
  loading,
  showMessage,
  initialMqttTopic,
}) => {
  const [imagePickerModalVisible, setImagePickerModalVisible] = useState(false);

  const handleImagePicker = () => {
    setImagePickerModalVisible(true);
  };

  const handleCamera = () => {
    setImagePickerModalVisible(false);
    launchCamera(
      {
        mediaType: 'photo',
        quality: 0.8,
        includeBase64: false,
      },
      (response) => {
        if (response.didCancel) {
          return;
        }
        if (response.errorMessage) {
          showMessage('Camera error: ' + response.errorMessage);
          return;
        }
        if (response.assets && response.assets[0]) {
          const asset = response.assets[0];
          onRoomDataChange({
            ...roomData,
            image: {
              uri: asset.uri,
              type: asset.type || 'image/jpeg',
              fileName: asset.fileName || `image_${Date.now()}.jpg`,
            },
          });
        }
      }
    );
  };

  const handleGallery = () => {
    setImagePickerModalVisible(false);
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.8,
        includeBase64: false,
      },
      (response) => {
        if (response.didCancel) {
          return;
        }
        if (response.errorMessage) {
          showMessage('Gallery error: ' + response.errorMessage);
          return;
        }
        if (response.assets && response.assets[0]) {
          const asset = response.assets[0];
          onRoomDataChange({
            ...roomData,
            image: {
              uri: asset.uri,
              type: asset.type || 'image/jpeg',
              fileName: asset.fileName || `image_${Date.now()}.jpg`,
            },
          });
        }
      }
    );
  };

  const handleRemoveImage = () => {
    onRoomDataChange({
      ...roomData,
      image: null,
    });
  };

  const handleCancel = () => {
    onRoomDataChange({
      A0_A1: '',
      A1_A2: '',
      A2_A3: '',
      A3_A0: '',
      label: '',
      mqtt_topic: initialMqttTopic || '',
      image: null,
    });
    onClose();
  };

  return (
    <>
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Create Room</Text>
          <ScrollView showsVerticalScrollIndicator={false}>
            <CustomInput
              label="Label"
              placeholder="Enter room label (e.g., Warehouse A)"
              style={styles.input}
              value={roomData.label}
              onChangeText={(text) =>
                onRoomDataChange({ ...roomData, label: text })
              }
            />
            <CustomInput
              label="MQTT Topic"
              placeholder="Enter MQTT topic"
              style={styles.input}
              value={roomData.mqtt_topic}
              onChangeText={(text) =>
                onRoomDataChange({ ...roomData, mqtt_topic: text })
              }
              editable={false}
            />
            <CustomInput
              label="First Wall (mm)"
              placeholder="Enter length of first wall"
              style={styles.input}
              value={roomData.A0_A1}
              onChangeText={(text) =>
                onRoomDataChange({ ...roomData, A0_A1: text })
              }
              keyboardType="numeric"
            />
            <CustomInput
              label="Second Wall (mm)"
              placeholder="Enter length of second wall"
              style={styles.input}
              value={roomData.A1_A2}
              onChangeText={(text) =>
                onRoomDataChange({ ...roomData, A1_A2: text })
              }
              keyboardType="numeric"
            />
            <CustomInput
              label="Third Wall (mm)"
              placeholder="Enter length of third wall"
              style={styles.input}
              value={roomData.A2_A3}
              onChangeText={(text) =>
                onRoomDataChange({ ...roomData, A2_A3: text })
              }
              keyboardType="numeric"
            />
            <CustomInput
              label="Fourth Wall (mm)"
              placeholder="Enter length of fouth wall"
              style={styles.input}
              value={roomData.A3_A0}
              onChangeText={(text) =>
                onRoomDataChange({ ...roomData, A3_A0: text })
              }
              keyboardType="numeric"
            />

            {/* Image Picker */}
            <View style={styles.imageContainer}>
              <Text style={styles.imageLabel}>Image</Text>
              {roomData.image ? (
                <View>
                  <Image
                    source={{ uri: roomData.image.uri }}
                    style={styles.imagePreview}
                    resizeMode="cover"
                  />
                  <TouchableOpacity
                    onPress={handleRemoveImage}
                    style={styles.removeImageButton}
                  >
                    <Text style={styles.removeImageText}>
                      Remove Image
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={handleImagePicker}
                  style={styles.imagePickerButton}
                >
                  <Text style={styles.imagePickerText}>
                    Tap to select room image
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
          <View style={styles.buttonContainer}>
            <CustomButton
              title="Cancel"
              onPress={handleCancel}
              cancel
            />
            <CustomButton
              title="Create Room"
              onPress={onSubmit}
              loading={loading}
            />
          </View>
        </View>
      </View>
    </Modal>

    {/* Image Picker Bottom Sheet Modal */}
    <Modal
      visible={imagePickerModalVisible}
      transparent
      animationType="slide"
      onRequestClose={() => setImagePickerModalVisible(false)}
    >
      <TouchableOpacity
        style={styles.bottomSheetOverlay}
        activeOpacity={1}
        onPress={() => setImagePickerModalVisible(false)}
      >
        <View
          style={styles.bottomSheetContainer}
          onStartShouldSetResponder={() => true}
        >
          <View style={styles.bottomSheetHandle} />
          <Text style={styles.bottomSheetTitle}>Select Image</Text>
          <TouchableOpacity
            style={styles.bottomSheetOption}
            onPress={handleCamera}
            activeOpacity={0.7}
          >
            <Text style={styles.bottomSheetOptionText}>📷 Camera</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.bottomSheetOption}
            onPress={handleGallery}
            activeOpacity={0.7}
          >
            <Text style={styles.bottomSheetOptionText}>🖼️ Gallery</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.bottomSheetOption, styles.bottomSheetCancel]}
            onPress={() => setImagePickerModalVisible(false)}
            activeOpacity={0.7}
          >
            <Text style={[styles.bottomSheetOptionText, styles.bottomSheetCancelText]}>
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
    </>
  );
};

export default CreateRoomModal;

