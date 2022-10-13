import axios,{AxiosError} from '../../src';
 
axios({
    method:'get',
    url:'/error/get1', 
}).then((res)=>{
    console.log(res)
}).catch((e)=>{ 
})
 
axios({
    method:'get',
    url:'/error/get', 
}).then((res)=>{
    console.log(res)
}).catch((e)=>{ 
})

axios({
    method:'get',
    url:'/error/timeout', 
    timeout:2000
}).then((res)=>{
    console.log(res)
}).catch((e:AxiosError)=>{
    console.log(e.message);
    console.log(e.code);
    console.log(e.config)
    console.log(e.isAxiosError)
})

setTimeout(()=>{
    axios({
        method:'get',
        url:'/error/get', 
    }).then((res)=>{
        console.log(res)
    }).catch((e)=>{
        
    })
},5000)
 