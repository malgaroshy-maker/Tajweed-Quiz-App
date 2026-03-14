async function run() {
  const res = await fetch('https://openrouter.ai/api/v1/models');
  const json = await res.json();
  const free = json.data.filter(m => parseFloat(m.pricing?.prompt) === 0);
  free.forEach(m => console.log(m.id));
}
run();
