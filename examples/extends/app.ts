import axios,{ AxiosError } from '../../src';
 
axios({
    method:'get',
    url:'/extend/get', 
}).then((res)=>{
    console.log(res)
}).catch((e)=>{
    console.log(e);
})

axios.request({
    url:'/extend/post',
    method:'post',
    data:{
        msg:'hellow'
    }
})
  
axios.get('/extend/get')

axios.options('/extend/options')

axios.delete('/extend/delete')

axios.post('/extend/post',{a:2})

axios.put('/extend/put')

axios.head('/extend/head')
  