import {staticResponse} from "@utils";
import { Middleware } from "../middlewareIntitializer";

const fallbackController : Middleware = ({res, err})=>{
   return staticResponse(res,err?.code ? Number(err.code) : undefined)
}

export default fallbackController