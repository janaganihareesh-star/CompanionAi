import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { getContacts, getCalendarEvents, sendNativeSMS } from '../../src/services/nativeOS';

export default function OSScreen() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const addLog = (msg) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const handleScanContacts = async () => {
    setLoading(true);
    addLog('Requesting Contacts Permission...');
    try {
      const contacts = await getContacts();
      addLog(`Found ${contacts.length} native system contacts.`);
    } catch (err) {
      addLog(`Error: ${err.message}`);
    }
    setLoading(false);
  };

  const handleScanCalendar = async () => {
    setLoading(true);
    addLog('Requesting Calendar Permission...');
    try {
      const today = new Date();
      const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      const events = await getCalendarEvents(today, nextWeek);
      addLog(`Found ${events.length} events in the next 7 days.`);
    } catch (err) {
      addLog(`Error: ${err.message}`);
    }
    setLoading(false);
  };

  const handleTestSMS = async () => {
    setLoading(true);
    addLog('Checking Native SMS availability...');
    try {
      // Hardcoded dummy number just to open the native compose view
      const res = await sendNativeSMS('1234567890', 'Hello from CloserAI deep OS test!');
      addLog(`SMS compose UI returned: ${res}`);
    } catch (err) {
      addLog(`Error: ${err.message}`);
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mobile OS Intelligence</Text>
        <Text style={styles.subtitle}>Test deep system-level integrations</Text>
      </View>

      <View style={styles.buttonGrid}>
        <TouchableOpacity style={styles.button} onPress={handleScanContacts} disabled={loading}>
          <Text style={styles.buttonText}>Scan Contacts</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={handleScanCalendar} disabled={loading}>
          <Text style={styles.buttonText}>Sync Calendar</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.accentButton]} onPress={handleTestSMS} disabled={loading}>
          <Text style={styles.buttonText}>Test Native SMS</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.consoleContainer}>
        <Text style={styles.consoleHeader}>System Event Log</Text>
        <ScrollView style={styles.consoleOutput}>
          {logs.map((log, i) => (
            <Text key={i} style={styles.logLine}>{log}</Text>
          ))}
          {loading && <ActivityIndicator color="#06b6d4" style={{ marginTop: 10 }} />}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f8fafc',
  },
  subtitle: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 4,
  },
  buttonGrid: {
    gap: 12,
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  accentButton: {
    backgroundColor: '#06b6d4',
    borderColor: '#0891b2',
  },
  buttonText: {
    color: '#f8fafc',
    fontWeight: 'bold',
    fontSize: 16,
  },
  consoleContainer: {
    flex: 1,
    backgroundColor: '#000000',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    overflow: 'hidden',
  },
  consoleHeader: {
    backgroundColor: '#1e293b',
    padding: 10,
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  consoleOutput: {
    padding: 12,
  },
  logLine: {
    color: '#34d399',
    fontFamily: 'monospace',
    fontSize: 12,
    marginBottom: 6,
  }
});
