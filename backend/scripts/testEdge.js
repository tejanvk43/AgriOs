const { EdgeTTS } = require('edge-tts');
const fs = require('fs');
const path = require('path');

// This depends on how the library exports. 
// Standard naming might be EdgeTTS or Tts. 
// Since documentation isn't visible, I'll try standard patterns.
// If this fails, I will check node_modules structure.

async function test() {
    try {
        const tts = new EdgeTTS({
            voice: 'en-IN-NeerjaNeural',
            lang: 'en-IN',
            outputFormat: 'audio-24khz-48kbitrate-mono-mp3'
        });

        await tts.ttsPromise("Hello, I am Neerja. This is a test of high quality neural voice.", "test.mp3");
        console.log("Audio file created: test.mp3");
    } catch (e) {
        console.error("Error:", e);
    }
}

// If the above import is wrong, let's try to print the module structure
try {
    const pkg = require('edge-tts');
    console.log("Package Exports:", Object.keys(pkg));
} catch (e) {
    console.log("Require failed");
}

// test();
