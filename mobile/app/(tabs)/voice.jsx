import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function VoiceScreen() {
  const [isListening, setIsListening] = useState(false);

  const toggleListening = () => {
    setIsListening(!isListening);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Voice Interface</Text>
      
      <View style={styles.pulseContainer}>
        {isListening && <View style={styles.pulseRing} />}
        <TouchableOpacity 
          style={[styles.micButton, isListening ? styles.micActive : null]}
          onPress={toggleListening}
        >
          <Ionicons name={isListening ? "mic" : "mic-outline"} size={48} color={isListening ? "#0f172a" : "#fff"} />
        </TouchableOpacity>
      </View>
      
      <Text style={styles.statusText}>
        {isListening ? "Listening to your voice..." : "Tap the microphone to speak"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    color: '#06b6d4',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 60,
  },
  pulseContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
    width: 200,
  },
  pulseRing: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#06b6d4',
    opacity: 0.3,
  },
  micButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#06b6d4',
  },
  micActive: {
    backgroundColor: '#06b6d4',
    borderColor: '#fff',
  },
  statusText: {
    color: '#94a3b8',
    marginTop: 40,
    fontSize: 16,
  }
});
