import axios from '../../src';
 

// axios({
//     method:'get',
//     url:'/base/get',
//     params:{
//         foo:['1','2']
//     }
// })

// axios({
//     method:'get',
//     url:'/base/get',
//     params:{
//         foo:{
//             bar:'baz'
//         }
//     }
// })

// const date=new Date();

// axios({
//     method:'get',
//     url:'/base/get',
//     params:{
//         date
//     }
// }) 

// axios({
//     method:'get',
//     url:'/base/get',
//     params:{
//         foo:'@$ '
//     }
// }) 

// axios({
//     method:'get',
//     url:'/base/get',
//     params:{
//         foo:'baz',
//         baz:null
//     }
// }) 

// axios({
//     method:'get',
//     url:'/base/get#11',
//     params:{
//         foo:'baz',
//         baz:null
//     }
// }) 

// axios({
//     method:'get',
//     url:'/base/get?baz=1',
//     params:{
//         foo:'baz', 
//     }
// }) 

// const arr=new Int32Array([21,31])

// axios({
//     method:'post',
//     url:'/base/buffer',
//     data:arr
// })
  
axios({
    method:'post',
    url:'/base/post', 
    data:{
        a:1,
        b:2
    }
}).then(res=>{
    console.log(res)
})

// axios({
//     method:'post',
//     url:'/base/post',
//     headers:{
//         'content-type':'application/json',
//         'Accept':'application/json,text/plain,*/*'
//     },
//     data:{
//         a:1,
//         b:2
//     }
// })

