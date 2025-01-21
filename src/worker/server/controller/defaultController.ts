import { welcomeRes } from "@utils";
import { Middleware } from "../middlewareIntitializer";

const defaultController : Middleware = (props)=>{
   return welcomeRes(props)
}

export default defaultController