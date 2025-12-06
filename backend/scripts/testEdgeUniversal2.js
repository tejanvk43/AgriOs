const { EdgeTTS, Communicate } = require('edge-tts-universal');
const fs = require('fs');

async function test() {
    try {
        console.log("Testing Communicate...");

        // 1. Try to generate simple audio
        const text = "Hello from Edge Universal";
        const voice = "en-US-AriaNeural"; // Standard reliable voice

        const comm = new Communicate(text, voice);

        // How to get data? 
        // Python: async for chunk in comm.stream(): ...
        // JS: maybe comm.stream() returns an AsyncIterator?

        const chunks = [];
        // Check if stream exists
        if (comm.stream) {
            console.log("Stream method found. Iterating...");
            for await (const chunk of comm.stream()) {
                if (chunk.type === 'audio') {
                    chunks.push(chunk.data);
                }
            }
        }

        if (chunks.length > 0) {
            const buffer = Buffer.concat(chunks);
            fs.writeFileSync('test_edge_2.mp3', buffer);
            console.log(`Success! Saved ${chunks.length} chunks to test_edge_2.mp3. Size: ${buffer.length}`);
        } else {
            console.log("No audio chunks received.");
        }

    } catch (e) {
        console.error("Test Error:", e);
    }
}

test();
