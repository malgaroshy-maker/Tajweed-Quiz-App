async function run() {
  const res = await fetch('https://openrouter.ai/api/v1/models');
  const json = await res.json();
  const freeGemini = json.data.filter(m => m.id.includes('gemini') && parseFloat(m.pricing?.prompt) === 0);
  freeGemini.forEach(m => console.log(m.id));
}
run();
