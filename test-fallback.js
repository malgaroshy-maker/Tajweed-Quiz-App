async function run() {
  const modelsToTry = [
    "meta-llama/llama-3.3-70b-instruct:free",
    "qwen/qwen3-next-80b-a3b-instruct:free",
    "google/gemma-3-27b-it:free"
  ];
  
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      models: modelsToTry,
      messages: [{ role: 'user', content: 'هل تفهم أحكام التجويد للقرآن الكريم؟ أجب بنعم أو لا فقط' }],
    }),
  });
  
  if (res.ok) {
    const data = await res.json();
    console.log("SUCCESS using model:", data.model);
    console.log("RESPONSE:", data.choices[0].message.content);
  } else {
    console.log("ERROR:", await res.text());
  }
}
run();
