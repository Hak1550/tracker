import React from 'react';
import { View, Text, Modal, TouchableOpacity } from 'react-native';
import { Colors } from '../../utils/colors';
import { styles } from './styles';

const DeviceOptionsModal = ({
  visible,
  onClose,
  device,
  onOpen,
  onCreateRoom,
  onEdit,
  onDelete,
}) => {
  const hasRoom = device?.room?.bound;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View
          style={styles.container}
          onStartShouldSetResponder={() => true}
        >
          <View style={styles.header}>
            <Text style={styles.title}>
              {device?.deviceName}
            </Text>
            <Text style={styles.subtitle}>
              Choose an action
            </Text>
          </View>
          <View style={styles.content}>
            {hasRoom ? (
              <TouchableOpacity
                style={[styles.button, styles.buttonOpen]}
                onPress={onOpen}
                activeOpacity={0.8}
              >
                <Text style={styles.buttonText}>Open</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.button, styles.buttonCreateRoom]}
                onPress={onCreateRoom}
                activeOpacity={0.8}
              >
                <Text style={styles.buttonText}>Create Room</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.button, styles.buttonEdit]}
              onPress={onEdit}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.buttonDelete]}
              onPress={onDelete}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>Delete</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.buttonCancel]}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Text style={[styles.buttonText, styles.buttonTextCancel]}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

export default DeviceOptionsModal;

