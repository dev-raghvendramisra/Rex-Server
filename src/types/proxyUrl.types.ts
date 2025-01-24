import { URL } from "url"

export class ProxyURL extends URL {
  urlString : string
  constructor(baseUrl:string,path?:string){
      if(path){
          super(path,baseUrl)
      }
      else super(baseUrl)
      this.urlString = baseUrl
  }
}

