async function test() {
  const res = await fetch('https://openrouter.ai/api/v1/models');
  const data = await res.json();
  console.log(JSON.stringify(data.data.slice(0, 3), null, 2));
}
test();
