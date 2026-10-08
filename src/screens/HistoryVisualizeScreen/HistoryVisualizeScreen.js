import React, { useMemo, useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Dimensions,
  ImageBackground,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import CustomHeader from '../../components/CustomHeader';
import { images } from '../../assets/images/images';
import { styles } from '../VisualizeRoomScreen/styles';
import dayjs from 'dayjs';
import { Colors } from '../../utils/colors';

const { width: WIDTH, height: HEIGHT } = Dimensions.get('window');

const PLAY_INTERVAL_MS = 80;

/**
 * Build room/anchors/bounds from history response (no tag positions - those are frame-based).
 */
function buildRoomFromHistory(historyResponse) {
  if (!historyResponse?.room) {
    return null;
  }
  const room = historyResponse.room;
  const width_in = room.width_in ?? 800;
  const height_in = room.height_in ?? 600;
  const anchor_positions = {
    A0: { x: 0, y: 0 },
    A1: { x: width_in, y: 0 },
    A2: { x: width_in, y: height_in },
    A3: { x: 0, y: height_in },
  };
  return {
    label: room.label,
    room_id: room.room_id,
    room_dimensions_in: { width_in, height_in },
    anchor_positions,
    mqtt_topic: historyResponse.mqtt_topic,
  };
}

/**
 * Sorted (ascending by timestamp) data for playback.
 */
function getSortedData(historyResponse) {
  const data = historyResponse?.data || [];
  return [...data].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  );
}

/**
 * At frame index N, return latest position per tag_id from records 0..N.
 */
function getTagPositionsAtFrame(sortedData, frameIndex) {
  const map = {};
  const end = Math.min(frameIndex + 1, sortedData.length);
  for (let i = 0; i < end; i++) {
    const record = sortedData[i];
    const tagId = record.tag_id;
    const pos = record.position || {};
    map[tagId] = {
      x: pos.x ?? 0,
      y: pos.y ?? 0,
      x_normalized: pos.x_normalized ?? 0.5,
      y_normalized: pos.y_normalized ?? 0.5,
      timestamp: record.timestamp,
      tag_id: record.tag_id,
    };
  }
  return map;
}

const HistoryVisualizeScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { historyResponse, roomLabel } = route.params || {};
console.log('historyResponse', historyResponse);
  const visualizeData = useMemo(
    () => buildRoomFromHistory(historyResponse),
    [historyResponse],
  );

  const sortedData = useMemo(
    () => getSortedData(historyResponse),
    [historyResponse],
  );

  const totalFrames = sortedData.length;
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!isPlaying || totalFrames === 0) return;
    intervalRef.current = setInterval(() => {
      setCurrentFrameIndex((prev) => {
        if (prev >= totalFrames - 1) {
          setIsPlaying(false);
          if (intervalRef.current) clearInterval(intervalRef.current);
          return prev;
        }
        return prev + 1;
      });
    }, PLAY_INTERVAL_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, totalFrames]);

  const currentTagPositions = useMemo(
    () => getTagPositionsAtFrame(sortedData, currentFrameIndex),
    [sortedData, currentFrameIndex],
  );

  const { anchors, bounds, centerX, centerY } = useMemo(() => {
    if (!visualizeData?.anchor_positions) {
      return {
        anchors: [],
        bounds: null,
        centerX: WIDTH / 2,
        centerY: HEIGHT / 2,
      };
    }
    const roomWidth = visualizeData.room_dimensions_in?.width_in ?? 800;
    const roomHeight = visualizeData.room_dimensions_in?.height_in ?? 600;
    const padding = 20;
    const reservedHeight = 220;
    const availableWidth = WIDTH - padding * 2;
    const availableHeight = Math.max(0, HEIGHT - padding * 2 - reservedHeight);
    const scaleX = availableWidth / roomWidth;
    const scaleY = availableHeight / roomHeight;
    const scale = Math.min(scaleX, scaleY);
    const roomRenderedWidth = roomWidth * scale;
    const roomRenderedHeight = Math.min(roomHeight * scale, availableHeight);
    const corners = [
      { x: padding, y: padding },
      { x: padding + roomRenderedWidth, y: padding },
      { x: padding + roomRenderedWidth, y: padding + roomRenderedHeight },
      { x: padding, y: padding + roomRenderedHeight },
    ];
    const anchorEntries = Object.entries(visualizeData.anchor_positions).sort(
      ([idA], [idB]) => {
        const numA = parseInt(idA.replace('A', '')) || 0;
        const numB = parseInt(idB.replace('A', '')) || 0;
        return numA - numB;
      },
    );
    const anchors = anchorEntries.map(([id, pos], index) => ({
      id,
      x: corners[Math.min(index, 3)].x,
      y: corners[Math.min(index, 3)].y,
      originalX: pos.x,
      originalY: pos.y,
    }));
    const bounds = {
      minX: padding,
      maxX: padding + roomRenderedWidth,
      minY: padding,
      maxY: padding + roomRenderedHeight,
    };
    const centerX =
      anchors.length > 0
        ? (Math.min(...anchors.map((a) => a.x)) + Math.max(...anchors.map((a) => a.x))) / 2
        : WIDTH / 2;
    const centerY =
      anchors.length > 0
        ? (Math.min(...anchors.map((a) => a.y)) + Math.max(...anchors.map((a) => a.y))) / 2
        : HEIGHT / 2;
    return { anchors, bounds, centerX, centerY };
  }, [visualizeData]);

  const tags = useMemo(() => {
    if (!bounds || !currentTagPositions) return [];
    return Object.entries(currentTagPositions).map(([tagId, tagData]) => {
      const x =
        bounds.minX +
        (tagData.x_normalized ?? 0) * (bounds.maxX - bounds.minX);
      const y =
        bounds.minY +
        (tagData.y_normalized ?? 0) * (bounds.maxY - bounds.minY);
      const timeStr = tagData.timestamp
        ? dayjs(tagData.timestamp).format('HH:mm:ss.SSS')
        : '–';
      return {
        id: `tag-${tagId}`,
        tagId,
        x,
        y,
        originalX: tagData.x,
        originalY: tagData.y,
        timestamp: tagData.timestamp,
        timeStr,
      };
    });
  }, [currentTagPositions, bounds]);

  if (!visualizeData) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <CustomHeader
          title="History"
          back
          navigation={navigation}
          onBack={() => navigation.goBack()}
        />
        <Text style={{ fontSize: 16, color: '#666' }}>No history data</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CustomHeader
        title={`${roomLabel || visualizeData.label || 'Room'} – History`}
        back
        navigation={navigation}
        onBack={() => navigation.goBack()}
      />
      <View style={styles.visualizationContainer}>
        {bounds && (
          <ImageBackground
            source={historyResponse?.room?.image_url ? { uri: historyResponse?.room?.image_url } : images.room}
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

        <View style={[styles.axisLine, styles.xAxis, { top: centerY }]} />
        <View style={[styles.axisLine, styles.yAxis, { left: centerX }]} />

        {anchors.map((anchor) => {
          const isTop = anchor.y === bounds?.minY;
          const isLeft = anchor.x === bounds?.minX;
          return (
            <View key={anchor.id}>
              <View
                style={[
                  styles.dot,
                  styles.anchor,
                  { left: anchor.x - 8, top: anchor.y - 8 },
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

        {tags.map((tag) => (
          <View key={tag.id}>
            <View
              style={[
                styles.dot,
                styles.tag,
                { left: tag.x - 8, top: tag.y - 8 },
              ]}
            />
            <Text
              style={[
                styles.tagLabel,
                { left: tag.x - 50, top: tag.y + 12 },
              ]}
              numberOfLines={2}
            >
              Tag {tag.tagId} · {tag.timeStr}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.playbackBar}>
        <TouchableOpacity
          style={[styles.playbackButton, !isPlaying && styles.playbackButtonActive]}
          onPress={() => {
            if (currentFrameIndex >= totalFrames - 1) setCurrentFrameIndex(0);
            setIsPlaying(true);
          }}
          disabled={totalFrames === 0}
        >
          <Text style={[styles.playbackButtonText, !isPlaying && styles.playbackButtonTextActive]}>Play</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.playbackButton, isPlaying && styles.playbackButtonActive]}
          onPress={() => setIsPlaying(false)}
          disabled={totalFrames === 0}
        >
          <Text style={[styles.playbackButtonText, isPlaying && styles.playbackButtonTextActive]}>Pause</Text>
        </TouchableOpacity>
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              {
                width: totalFrames > 0 ? `${((currentFrameIndex + 1) / totalFrames) * 100}%` : '0%',
              },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {totalFrames > 0
            ? `${currentFrameIndex + 1} / ${totalFrames} · ${sortedData[currentFrameIndex]?.timestamp ? dayjs(sortedData[currentFrameIndex].timestamp).format('HH:mm:ss.SSS') : '–'}`
            : 'No data'}
        </Text>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
          MQTT: {visualizeData.mqtt_topic} · {tags.length} record(s)
        </Text>
      </View>
    </View>
  );
};

export default HistoryVisualizeScreen;
