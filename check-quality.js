async function run() {
  const res = await fetch('https://openrouter.ai/api/v1/models');
  const json = await res.json();
  const free = json.data.filter(m => parseFloat(m.pricing?.prompt) === 0);
  const goodModels = free.filter(m => 
    m.id.includes('llama-3.3-70b') || 
    m.id.includes('qwen') || 
    m.id.includes('gemma-3-27b') ||
    m.id.includes('gemini') ||
    m.id.includes('nemotron-3-super')
  );
  goodModels.forEach(m => console.log(m.id, '-', m.name));
}
run();
