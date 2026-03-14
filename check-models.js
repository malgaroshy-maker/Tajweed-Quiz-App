async function run() {
  const res = await fetch('https://openrouter.ai/api/v1/models');
  const json = await res.json();
  const freeModels = json.data.filter(m => 
    parseFloat(m.pricing?.prompt || '1') === 0 && 
    parseFloat(m.pricing?.completion || '1') === 0
  );
  
  console.log("FREE MODELS:");
  freeModels.forEach(m => console.log(`- ${m.id}: ${m.name} (Context: ${m.context_length})`));
}
run();
