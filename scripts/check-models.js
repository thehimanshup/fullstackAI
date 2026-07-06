const key = "AIzaSyA_0_2pVeOM-RriWgFuxumumJfAEdxflAc";
async function listModels() {
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
        const data = await response.json();
        if (data.models) {
            const geminiModels = data.models.filter(m => m.name.toLowerCase().includes('gemini'));
            console.log(JSON.stringify(geminiModels, null, 2));
        } else {
            console.log("No models found or error:", data);
        }
    } catch (error) {
        console.error("Error listing models:", error);
    }
}
listModels();
