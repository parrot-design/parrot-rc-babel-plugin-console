// @ts-ignore
const isArray=(arg)=>Object.prototype.toString.call(arg)==='[object Array]';

const isProduction=process.env.NODE_ENV==="production";

const visitor={   
    
    // @ts-ignore
    CallExpression(path,{ opts }){
        const { exclude,commentWords } = opts;
        const calleePath = path.get("callee");
        console.log("==process.env",process.env.NODE_ENV)
        if(isArray(exclude)){
            // @ts-ignore
            const hasTarget=opts.exclude.some(type=>{
                return calleePath.matchesPattern("console."+type);
            });
            if(hasTarget) return;
        }
       
        if (calleePath.matchesPattern("console", true)) {
            path.remove()
        }
    }
}
 
export default ()=>{  
    return {
        name:'@parrotjs/babel-plugin-console',
        visitor
    }
}