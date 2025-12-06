const { EdgeTTS } = require('edge-tts-universal');
const fs = require('fs');

async function test() {
    try {
        const tts = new EdgeTTS();

        // 1. List voices to find Indian ones
        const voices = await tts.getVoices();
        const indianVoices = voices.filter(v => v.ShortName.includes('IN'));
        console.log("Indian Voices Found:", indianVoices.map(v => v.ShortName));

        // 2. Generate Audio
        const voice = 'hi-IN-SwaraNeural'; // Optimistic guess, logic will handle actual selection
        console.log(`Generating audio with ${voice}...`);

        // API Check: Does it return buffer?
        // Documentation says it closely mimics python edge-tts?
        // Let's try tts.ttsPromise or something similar?
        // Wait, 'edge-tts-universal' API might be different. 
        // Based on search "Replicates the necessary communication". 
        // Let's inspect the object if my guess fails, but let's try standard synthesize.

        await tts.ttsPromise("Namaste, this is Neural Voice.", "test_universal.mp3");
        console.log("Success! Audio saved to test_universal.mp3");

    } catch (e) {
        console.error("Test Error:", e);
        // Inspect if method fails
    }
}

// Fallback inspection if require fails or class is different
try {
    const pkg = require('edge-tts-universal');
    console.log("Package Exports:", Object.keys(pkg));
} catch (e) {
    console.error("Require failed", e);
}

test();
