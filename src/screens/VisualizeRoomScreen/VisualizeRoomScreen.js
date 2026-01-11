import React, { useEffect, useState, useMemo, useRef } from 'react';
import {
  View,
  Text,
  Dimensions,
  Image,
  ImageBackground,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import io from 'socket.io-client';
import { Colors } from '../../utils/colors';
import CustomHeader from '../../components/CustomHeader';
import { images } from '../../assets/images/images';
import { styles } from './styles';

const { width: WIDTH, height: HEIGHT } = Dimensions.get('window');
const WEBSOCKET_URL = 'http://15.204.231.252:8000';

const VisualizeRoomScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { visualizeData: initialVisualizeData, roomId } = route.params || {};
  const token = useSelector((state) => state.auth.token);
  const [visualizeData, setVisualizeData] = useState(initialVisualizeData || {});
  const [tags, setTags] = useState([]);
  const socketRef = useRef(null);
  
  // Get room_id from visualizeData or route params
  const room_id = visualizeData?.room_id || roomId;

  // Memoize coordinate calculation to prevent infinite loops
  const { anchors, bounds, centerX, centerY, roomImage } = useMemo(() => {
    if (!visualizeData?.anchor_positions) {
      return {
        anchors: [],
        bounds: null,
        centerX: WIDTH / 2,
        centerY: HEIGHT / 2,
        roomImage: null,
      };
    }

    // Use room_dimensions_in from API if available, otherwise calculate from anchor positions
    let roomWidth, roomHeight;
    if (visualizeData?.room_dimensions_in?.width_in && visualizeData?.room_dimensions_in?.height_in) {
      roomWidth = visualizeData.room_dimensions_in.width_in;
      roomHeight = visualizeData.room_dimensions_in.height_in;
    } else {
      // Calculate room dimensions from anchor positions
      const positions = Object.values(visualizeData.anchor_positions);
      const minX = Math.min(...positions.map(p => p.x));
      const maxX = Math.max(...positions.map(p => p.x));
      const minY = Math.min(...positions.map(p => p.y));
      const maxY = Math.max(...positions.map(p => p.y));
      roomWidth = maxX - minX;
      roomHeight = maxY - minY;
    }

    // Calculate scale to fit room on screen - minimal padding to stretch to corners
    const padding = 20; // Reduced padding to stretch image more
    const availableWidth = WIDTH - padding * 2;
    const availableHeight = HEIGHT - padding * 2 - 100; // Account for header

    const scaleX = availableWidth / roomWidth;
    const scaleY = availableHeight / roomHeight;
    const scale = Math.min(scaleX, scaleY);

    // Define corners: A0 (top-left), A1 (top-right), A2 (bottom-right), A3 (bottom-left)
    // Position anchors exactly at the corners of the room bounds
    const corners = [
      { x: padding, y: padding }, // Top-left (A0)
      { x: padding + roomWidth * scale, y: padding }, // Top-right (A1)
      { x: padding + roomWidth * scale, y: padding + roomHeight * scale }, // Bottom-right (A2)
      { x: padding, y: padding + roomHeight * scale }, // Bottom-left (A3)
    ];

    // Map anchors to corners - sort by ID to ensure A0, A1, A2, A3 order
    const anchorEntries = Object.entries(visualizeData.anchor_positions)
      .sort(([idA], [idB]) => {
        // Extract number from anchor ID (A0, A1, A2, A3)
        const numA = parseInt(idA.replace('A', '')) || 0;
        const numB = parseInt(idB.replace('A', '')) || 0;
        return numA - numB;
      });

    const anchors = anchorEntries.map(([id, pos], index) => {
      // Map to corner based on sorted index (A0->0, A1->1, A2->2, A3->3)
      const cornerIndex = Math.min(index, 3);
      
      return {
        id,
        x: corners[cornerIndex].x,
        y: corners[cornerIndex].y,
        originalX: pos.x,
        originalY: pos.y,
      };
    });

    const bounds = {
      minX: padding,
      maxX: padding + roomWidth * scale,
      minY: padding,
      maxY: padding + roomHeight * scale,
    };

    const centerX = anchors.length > 0
      ? (Math.min(...anchors.map(a => a.x)) + Math.max(...anchors.map(a => a.x))) / 2
      : WIDTH / 2;
    const centerY = anchors.length > 0
      ? (Math.min(...anchors.map(a => a.y)) + Math.max(...anchors.map(a => a.y))) / 2
      : HEIGHT / 2;

    // Use API image if available, otherwise use dummy placeholder
    const roomImage = visualizeData?.image || visualizeData?.image_url || null;

    return { anchors, bounds, centerX, centerY, roomImage };
  }, [visualizeData?.anchor_positions, visualizeData?.room_dimensions_in, visualizeData?.image, visualizeData?.image_url]);

  // Convert tag positions from API to screen coordinates
  useEffect(() => {
    if (visualizeData?.tag_positions && bounds) {
      const tagPositions = visualizeData.tag_positions;
      const convertedTags = Object.entries(tagPositions).map(([id, tagData]) => {
        // Use normalized coordinates to position tags
        const x = bounds.minX + (tagData.x_normalized || 0) * (bounds.maxX - bounds.minX);
        const y = bounds.minY + (tagData.y_normalized || 0) * (bounds.maxY - bounds.minY);
        
        return {
          id: `TAG ${id}`,
          x,
          y,
          originalX: tagData.x,
          originalY: tagData.y,
          ranges: tagData.ranges,
          selectedAnchors: tagData.selected_anchors,
          status: tagData.status,
          timestamp: tagData.timestamp,
        };
      });
      setTags(convertedTags);
    } else {
      setTags([]);
    }
  }, [visualizeData?.tag_positions, bounds?.minX, bounds?.minY, bounds?.maxX, bounds?.maxY]);

  // WebSocket connection and real-time updates
  useEffect(() => {
    if (!token || !room_id || !visualizeData?.mqtt_topic) {
      return;
    }

    // Connect to WebSocket server
    const socket = io(WEBSOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    // Handle connection
    socket.on('connect', () => {
      console.log('WebSocket connected');
    });

    // Handle successful authentication
    socket.on('connected', (data) => {
      console.log('WebSocket authenticated:', data);
      
      // Start visualization
      socket.emit('start_visualization', {
        room_id: room_id,
        mqtt_topic: visualizeData.mqtt_topic,
        update_interval: 0.5,
      });
    });

    // Handle visualization started
    socket.on('visualization_started', (data) => {
      console.log('Visualization started:', data);
    });

    // Handle real-time position updates
    socket.on('position_update', (data) => {
      console.log('Position update received:', data);
      
      // Update visualization data with new positions
      setVisualizeData((prev) => ({
        ...prev,
        anchor_positions: data.anchor_positions || prev.anchor_positions,
        tag_positions: data.tag_positions || prev.tag_positions,
        room_dimensions_in: data.room_dimensions_in || prev.room_dimensions_in,
        timestamp: data.timestamp,
      }));
    });

    // Handle visualization stopped
    socket.on('visualization_stopped', (data) => {
      console.log('Visualization stopped:', data);
    });

    // Handle errors
    socket.on('error', (data) => {
      console.error('WebSocket error:', data);
    });

    // Cleanup on unmount
    return () => {
      if (socket && socket.connected) {
        socket.emit('stop_visualization');
        socket.disconnect();
      }
      socketRef.current = null;
    };
  }, [token, room_id, visualizeData?.mqtt_topic]);

  // Cleanup on navigation away
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', () => {
      if (socketRef.current && socketRef.current.connected) {
        socketRef.current.emit('stop_visualization');
        socketRef.current.disconnect();
      }
    });

    return unsubscribe;
  }, [navigation]);

  return (
    <View style={styles.container}>
      <CustomHeader
        title={visualizeData?.label || 'Room Visualization'}
        back
        navigation={navigation}
        onBack={() => navigation.goBack()}
      />
      <View style={styles.visualizationContainer}>
        {/* Background Room Image - Stretched to corners */}
        {bounds && (
          <ImageBackground
            source={roomImage ? { uri: roomImage } : images.room}
            style={[
              styles.roomBackground,
              {
                left: bounds.minX,
                top: bounds.minY,
                width: bounds.maxX - bounds.minX,
                height: bounds.maxY - bounds.minY,
              },
            ]}
            resizeMode="stretch"
            imageStyle={styles.roomBackgroundImage}
          >
            <View style={styles.roomOverlay} />
          </ImageBackground>
        )}

        {/* X and Y axis lines */}
        <View style={[styles.axisLine, styles.xAxis, { top: centerY }]} />
        <View style={[styles.axisLine, styles.yAxis, { left: centerX }]} />

        {/* Anchors (Black Dots) at corners */}
        {anchors.map(anchor => {
          // Position labels based on which corner
          const isTop = anchor.y === bounds?.minY;
          const isLeft = anchor.x === bounds?.minX;
          
          return (
            <View key={anchor.id}>
              <View
                style={[
                  styles.dot,
                  styles.anchor,
                  {
                    left: anchor.x - 8,
                    top: anchor.y - 8,
                  },
                ]}
              />
              <Text
                style={[
                  styles.anchorLabel,
                  {
                    left: isLeft ? anchor.x + 12 : anchor.x - 80,
                    top: isTop ? anchor.y + 12 : anchor.y - 28,
                  },
                ]}
              >
                {`${anchor.id} (${Math.round(anchor.originalX)}, ${Math.round(anchor.originalY)})`}
              </Text>
            </View>
          );
        })}

        {/* Tags (Red Dots) */}
        {tags.map(tag => (
          <View key={tag.id}>
            <View
              style={[
                styles.dot,
                styles.tag,
                {
                  left: tag.x - 8,
                  top: tag.y - 8,
                },
              ]}
            />
            <Text
              style={[
                styles.tagLabel,
                {
                  left: tag.x - 35,
                  top: tag.y + 12,
                },
              ]}
            >
              {`${tag.id} (${Math.round(tag.originalX)}, ${Math.round(tag.originalY)})`}
            </Text>
          </View>
        ))}
      </View>

      {/* Info Section */}
      {visualizeData?.mqtt_topic && (
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>MQTT Topic: {visualizeData.mqtt_topic}</Text>
          {visualizeData?.msg && (
            <Text style={styles.infoMessage}>{visualizeData.msg}</Text>
          )}
        </View>
      )}
    </View>
  );
};

export default VisualizeRoomScreen;

