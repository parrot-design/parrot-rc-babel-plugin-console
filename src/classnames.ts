let hasOwn={}.hasOwnProperty;

export default function classnames(...args:any[]):string{
    
    let classes=[];

    for(let i=0;i<arguments.length;i++){

        let arg=arguments[i];

        if(!arg) continue ;

        let argType=typeof arg;

        if(argType==='string' || argType==='number'){
            classes.push(arg);
        }else if(Array.isArray(arg)){
            if(arg.length){
                let inner = classnames.apply(null, arg);
                if(inner){
                    classes.push(inner);
                }
            }
        }else if(argType==='object'){
            if(arg.toString===Object.prototype.toString){
                for(let key in arg){
                    if (hasOwn.call(arg, key) && arg[key]) {
                        classes.push(key);
                    }
                }
            }else{
                classes.push(arg.toString());
            }
        }

    }

    return classes.join(' ')

}