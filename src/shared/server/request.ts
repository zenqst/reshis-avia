export class RequestError extends Error { constructor(public status:number,message:string){super(message);} }
export function requireOrigin(request:Request){
 const origin=request.headers.get('origin');
 if(!origin||origin!==new URL(request.url).origin||request.headers.get('sec-fetch-site')==='cross-site')throw new RequestError(403,'Недопустимый источник запроса');
}
export async function readJson(request:Request):Promise<Record<string,unknown>>{
 if(request.headers.get('content-type')?.split(';')[0].trim().toLowerCase()!=='application/json')throw new RequestError(415,'Ожидается JSON');
 if(Number(request.headers.get('content-length')??0)>16384)throw new RequestError(413,'Слишком большой запрос');
 const reader=request.body?.getReader();if(!reader)throw new RequestError(400,'Пустой запрос');
 const chunks:Uint8Array[]=[];let size=0;
 try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>16384){await reader.cancel();throw new RequestError(413,'Слишком большой запрос');}chunks.push(value);}}finally{reader.releaseLock();}
 const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.byteLength;}
 let body;try{body=JSON.parse(new TextDecoder().decode(bytes));}catch{throw new RequestError(400,'Некорректный JSON');}
 if(!body||typeof body!=='object'||Array.isArray(body))throw new RequestError(400,'Ожидается объект JSON');return body;
}
export function errorResponse(error:unknown){
 if(error instanceof RequestError)return Response.json({error:error.message},{status:error.status,headers:{'Cache-Control':'no-store'}});
 console.error('request_failed',{code:typeof (error as {code?:unknown})?.code==='string'?(error as {code:string}).code:'INTERNAL'});
 return Response.json({error:'Сервис временно недоступен'},{status:503,headers:{'Cache-Control':'no-store'}});
}

