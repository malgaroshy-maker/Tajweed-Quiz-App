async function run() {
  const systemPrompt = `أنت خبير في علم التجويد ومعلم للقرآن الكريم. 
قم بتوليد 1 أسئلة عن موضوع "أحكام النون الساكنة" بمستوى صعوبة "متوسط".
الأسئلة يجب أن تكون باللغة العربية.
قم بإرجاع النتيجة بصيغة JSON فقط كالتالي:
[
  {
    "text": "نص السؤال هنا",
    "type": "multiple_choice",
    "options": [
      { "text": "خيار 1", "is_correct": true },
      { "text": "خيار 2", "is_correct": false },
      { "text": "خيار 3", "is_correct": false },
      { "text": "خيار 4", "is_correct": false }
    ],
    "explanation": "شرح الإجابة"
  }
]`;

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'openrouter/free',
      messages: [{ role: 'user', content: systemPrompt }],
    }),
  });
  
  if (res.ok) {
    const data = await res.json();
    console.log(data.choices[0].message.content);
  } else {
    console.log("ERROR:", await res.text());
  }
}
run();
