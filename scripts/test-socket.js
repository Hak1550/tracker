#!/usr/bin/env node
/**
 * Socket.IO test script for UWB WebSocket API
 * Usage:
 *   TOKEN=your_jwt_token node scripts/test-socket.js
 *   TOKEN=your_jwt ROOM_ID=xxx MQTT_TOPIC=1000001 node scripts/test-socket.js
 *   node scripts/test-socket.js  (will prompt for token or use env)
 *
 * Get token: POST http://15.204.231.252/api/login with { email, password }
 */

const { io } = require('socket.io-client');

const WEBSOCKET_URL = process.env.WS_URL || 'http://15.204.231.252:8000';
const TOKEN = process.env.TOKEN || '';
const ROOM_ID = process.env.ROOM_ID || '695b2c38b106433e76b326d9';
const MQTT_TOPIC = process.env.MQTT_TOPIC || '1000001';
const UPDATE_INTERVAL = parseFloat(process.env.UPDATE_INTERVAL || '0.5', 10);
const RUN_SECONDS = process.env.RUN_SECONDS ? parseInt(process.env.RUN_SECONDS, 10) : 30;

function log(msg, data = null) {
  const ts = new Date().toISOString();
  console.log(`[${ts}] ${msg}`);
  if (data !== null && data !== undefined) {
    console.log(JSON.stringify(data, null, 2));
  }
}

function main() {
  if (!TOKEN) {
    console.error('Missing TOKEN. Set env: TOKEN=your_jwt_token');
    console.error('Example: TOKEN=eyJhbGc... node scripts/test-socket.js');
    process.exit(1);
  }

  log('Connecting to', WEBSOCKET_URL);
  const socket = io(WEBSOCKET_URL, {
    auth: { token: TOKEN },
    transports: ['websocket', 'polling'],
  });

  socket.on('connect', () => {
    log('Socket connected (transport: ' + (socket.io?.engine?.transport?.name || '?') + ')');
  });

  socket.on('connected', (data) => {
    log('Authenticated', data);
    log('Starting visualization', { room_id: ROOM_ID, mqtt_topic: MQTT_TOPIC, update_interval: UPDATE_INTERVAL });
    socket.emit('start_visualization', {
      room_id: ROOM_ID,
      mqtt_topic: MQTT_TOPIC,
      update_interval: UPDATE_INTERVAL,
    });
  });

  socket.on('visualization_started', (data) => {
    log('Visualization started', data);
  });

  socket.on('position_update', (data) => {
    log('position_update', {
      timestamp: data.timestamp,
      tag_count: data.tag_count,
      tag_positions: data.tag_positions,
    });
  });

  socket.on('visualization_stopped', (data) => {
    log('Visualization stopped', data);
  });

  socket.on('error', (data) => {
    log('Error', data);
  });

  socket.on('connect_error', (err) => {
    log('Connection error', { message: err.message });
  });

  socket.on('disconnect', (reason) => {
    log('Disconnected', { reason });
  });

  const stop = () => {
    log('Stopping visualization and disconnecting...');
    if (socket.connected) {
      socket.emit('stop_visualization');
      socket.disconnect();
    }
    process.exit(0);
  };

  process.on('SIGINT', stop);
  process.on('SIGTERM', stop);

  if (RUN_SECONDS > 0) {
    setTimeout(stop, RUN_SECONDS * 1000);
    log(`Will auto-stop after ${RUN_SECONDS} seconds. Press Ctrl+C to stop earlier.`);
  } else {
    log('Running until Ctrl+C. Set RUN_SECONDS=30 to auto-stop after 30s.');
  }
}

main();
