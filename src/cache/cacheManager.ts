import { ServerInstance} from "@types"
import { IncomingHttpHeaders, IncomingMessage } from "http"
import { Writable } from "stream"
   
    interface ICache{
        headers:IncomingHttpHeaders,
        body:string | Buffer,
        expiry:number
    }

    export class CacheManager {
       private _cache : Map<string,ICache>
       constructor(){
        this._cache = new Map()
       }
       
       exists(key : string){
          if (this._cache.has(key)){
             const expiry = this._cache.get(key)?.expiry as number
             if(expiry > Date.now()){
                return true
             }
             else {
                return this.remove(key)
             }
          }
          return false
       }
       
       get(key:string){
          if(this.exists(key)){
            return this._cache.get(key) as ICache
          }
          else return false
       }
    
       set(key:string, data : ICache){
           this._cache.set(key,data)
       }

       clear(){
        this._cache.clear()
       }
    
       remove(key:string){
        return this._cache.delete(key)
       }

       getState(){
        return this._cache.keys()
       }

       pipeIn(res:IncomingMessage,headers : IncomingHttpHeaders ,key:string,expiry = Date.now()+1000*60*5){
        let resBody :Uint8Array<ArrayBufferLike>[]= [];
        const cacheStream = new Writable({
            write(chunk,encoding,cb){
                resBody.push(chunk)
                cb()
            }
           })
        res.pipe(cacheStream)
        res.on('end',()=>{
            let body = Buffer.concat(resBody)
            this.set(key,{
                headers,
                body,
                expiry
            })
        })
       }
    }

    export function respectCacheHeaders(headers : IncomingHttpHeaders){
       const cacheHeader  = headers["cache-control"]
       if(cacheHeader){
          if(cacheHeader.includes('public')){
             let expiry : number | string = Number(cacheHeader.split("max-age=")[1])
             if(Number.isNaN(expiry)){
                return expiry
             }
             return Date.now()+1000*60*5
          }
          else false;
       }
       return false
    } 

    export function checkCachingPermission(serverInstance : ServerInstance){
     const cachingPermission = {
        DESABLED:false as false,
        RESPECT:{
            respect:true as true
        },
        OVERRIDE:{
            respect:false as false
        }

     }
     return cachingPermission[serverInstance.caching]
    }


const cacheStore = new CacheManager()
export default cacheStore

