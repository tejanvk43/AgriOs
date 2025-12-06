async function inspect() {
    try {
        const pkg = await import('edge-tts');
        console.log("Keys:", Object.keys(pkg));
        // Check if there is a default export
        if (pkg.default) {
            console.log("Default Keys:", Object.keys(pkg.default));
        }
    } catch (e) {
        console.error("Import failed:", e);
    }
}
inspect();
