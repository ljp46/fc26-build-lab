// Translate the existing adviser contract to the OpenAI Responses API.
export async function openaiRequest(payload, env, send) {
  const research = !!payload.tools;
  const body = {
    model: env.OPENAI_MODEL || 'gpt-5.4-mini',
    store: false,
    reasoning: {effort: 'low'},
    max_output_tokens: research ? 2500 : 8000,
    input: payload.contents.map(item => ({
      role: item.role === 'model' ? 'assistant' : 'user',
      content: item.parts.map(part => part.text || '').join('\n')
    }))
  };
  if (payload.systemInstruction) body.instructions = payload.systemInstruction.parts.map(p => p.text).join('\n');
  if (research) {
    body.tools = [{type:'web_search', search_context_size:'low'}];
    body.max_tool_calls = 1;
  } else {
    body.text = {format:{type:'json_schema', name:'build_advice', strict:true,
      schema:{...payload.generationConfig.responseJsonSchema, additionalProperties:false}}};
  }
  const response = await send('https://api.openai.com/v1/responses', {
    method:'POST', headers:{'Content-Type':'application/json', Authorization:`Bearer ${env.OPENAI_API_KEY}`},
    body:JSON.stringify(body)
  });
  if (!response.ok) return response;
  const result = await response.json();
  const parts = (result.output || []).filter(item => item.type === 'message').flatMap(item => item.content || []);
  if (result.status !== 'completed' || parts.some(part => part.type === 'refusal')) {
    return Response.json({error:{message:'The model response was incomplete or declined.'}}, {status:422});
  }
  const text = parts.filter(part => part.type === 'output_text').map(part => part.text).join('');
  const sources = parts.flatMap(part => part.annotations || []).filter(a => a.type === 'url_citation');
  return Response.json({candidates:[{content:{parts:[{text}]},groundingMetadata:{groundingChunks:sources.map(s=>({web:{title:s.title,uri:s.url}}))}}]});
}
