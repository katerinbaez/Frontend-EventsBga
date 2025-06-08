/**
 * Componente de superposición de depuración para mostrar logs en tiempo real
 * - UI
 * - Depuración
 * - Logs
 * - Overlay
 * - Consola
 */

import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

const logs = [];
const maxLogs = 50; 

const originalConsoleLog = console.log;
const originalConsoleWarn = console.warn;
const originalConsoleError = console.error;

const addLog = (type, ...args) => {
  const log = {
    id: Date.now(),
    timestamp: new Date().toLocaleTimeString(),
    type,
    message: args.map(arg => {
      if (typeof arg === 'object') {
        try {
          return JSON.stringify(arg, null, 2);
        } catch (e) {
          return String(arg);
        }
      }
      return String(arg);
    }).join(' ')
  };
  
  logs.unshift(log); 
  if (logs.length > maxLogs) {
    logs.pop();
  }
};

console.log = (...args) => {
  originalConsoleLog(...args);
  addLog('log', ...args);
};

console.warn = (...args) => {
  originalConsoleWarn(...args);
  addLog('warn', ...args);
};

console.error = (...args) => {
  originalConsoleError(...args);
  addLog('error', ...args);
};

const DebugOverlay = ({ visible = true }) => {
  const [localLogs, setLocalLogs] = useState([]);
  const [expanded, setExpanded] = useState(false);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setLocalLogs([...logs]);
    }, 500);
    
    return () => clearInterval(interval);
  }, []);
  
  if (!visible) return null;
  
  const toggleExpanded = () => setExpanded(!expanded);
  
  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={[styles.header, expanded ? styles.headerExpanded : null]} 
        onPress={toggleExpanded}
      >
        <Text style={styles.headerText}>
          {expanded ? 'Debug Logs (Tap to minimize)' : 'Debug Logs (Tap to expand)'}
        </Text>
      </TouchableOpacity>
      
      {expanded && (
        <ScrollView style={styles.logContainer}>
          {localLogs.map(log => (
            <View 
              key={log.id} 
              style={[
                styles.logItem, 
                log.type === 'warn' ? styles.warnLog : null,
                log.type === 'error' ? styles.errorLog : null
              ]}
            >
              <Text style={styles.timestamp}>{log.timestamp}</Text>
              <Text style={styles.logText}>{log.message}</Text>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    zIndex: 9999,
  },
  header: {
    padding: 5,
    backgroundColor: '#333',
    alignItems: 'center',
  },
  headerExpanded: {
    borderBottomWidth: 1,
    borderBottomColor: '#555',
  },
  headerText: {
    color: 'white',
    fontWeight: 'bold',
  },
  logContainer: {
    maxHeight: 300,
  },
  logItem: {
    padding: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#444',
  },
  warnLog: {
    backgroundColor: 'rgba(255, 204, 0, 0.3)',
  },
  errorLog: {
    backgroundColor: 'rgba(255, 0, 0, 0.3)',
  },
  timestamp: {
    color: '#aaa',
    fontSize: 10,
  },
  logText: {
    color: 'white',
    fontSize: 12,
  },
});

export default DebugOverlay;
