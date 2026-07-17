const fs = require('fs');
const path = require('path');
const os = require('os');
const { generateContent } = require('./aiService');
const { MsEdgeTTS, OUTPUT_FORMAT } = require('msedge-tts');

const activeStreams = new Map();

const initializeRealtimeAudio = (socket) => {
    
    // Interrupt generation flag
    socket.on('interrupt_generation', () => {
      activeStreams.set(socket.id, false); // Set active flag to false
      socket.emit('clear_audio_queue');
    });

    socket.on('native_voice_stream', async (payload) => {
      try {
        const { audioBase64, userId, conversationId } = payload;
        if (!audioBase64) return;
        
        activeStreams.set(socket.id, true); // Enable streaming for this socket
        
        const base64Data = audioBase64.split(';base64,').pop();
        const mimeType = audioBase64.includes('mp4') ? 'audio/mp4' : 'audio/webm';
        
        // Pass audio directly to Gemini 1.5 Flash for transcription and response
        const aiResponse = await generateContent(
          [{
            inlineData: {
              data: base64Data,
              mimeType: mimeType
            }
          }, "Please respond to this concisely in English or Telugu."],
          'gemini-1.5-flash',
          [],
          [],
          false
        );

        if (!activeStreams.get(socket.id)) return; // Abort if interrupted
        
        // Generate TTS for the response using Microsoft Edge TTS (Natural Voice)
        const tts = new MsEdgeTTS();
        await tts.setMetadata('en-IN-NeerjaNeural', OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
        
        const audioBuffer = [];
        const { audioStream } = tts.toStream(aiResponse.text);
        
        audioStream.on('data', (chunk) => {
          audioBuffer.push(chunk);
        });
        
        audioStream.on('end', () => {
          if (activeStreams.get(socket.id)) {
            const finalBuffer = Buffer.concat(audioBuffer);
            const audioUrl = `data:audio/mpeg;base64,${finalBuffer.toString('base64')}`;
            socket.emit('live_audio_chunk', { audioUrl });
          }
        });
        
      } catch (err) {
        console.error('Native Voice Stream Error:', err);
      }
    });

    socket.on('disconnect', () => {
      activeStreams.delete(socket.id);
    });
};

module.exports = { initializeRealtimeAudio };
