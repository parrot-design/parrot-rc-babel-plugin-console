const express=require('express');
const bodyParser=require('body-parser');
const webpackConfig=require('./webpack.config');
const webpack=require('webpack');
const webpackDevMiddleware=require('webpack-dev-middleware');
const webpackHotMiddleware=require('webpack-hot-middleware'); 
const app=express();
const compiler=webpack(webpackConfig);

app.use(webpackDevMiddleware(compiler,{
    publicPath:'/__build__/',
    stats:{
        colors:true,
        chunks:false
    }
}));

app.use(webpackHotMiddleware(compiler));

app.use(express.static(__dirname));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

const router=express.Router();

router.get('/simple/get',function(req,res){
    res.end('Hello1 world')
});

router.get('/base/get',function(req,res){
    res.json(req.query)
});

router.post('/base/post',function(req,res){
    res.json(req.body)
});

router.post('/base/buffer',function(req,res){
    let msg=[];
    req.on('data',(chunk)=>{
        if(chunk){
            msg.push(chunk)
        }
    })
    req.on('end',()=>{
        let buf=Buffer.concat(msg);
        res.json(buf.toJSON());
    }) 
});

router.get('/error/get',function(req,res){
    if(Math.random()>0.5){
        res.json({
            msg:'hello world'
        })
    }else{
        res.status(500)
        res.end()
    }
});

router.get('/error/timeout',function(req,res){
    setTimeout(()=>{
        res.json({
            msg:'hello world'
        })
    },30000)
});

registerExtendRouter()

registerMoreRouter()

app.use(router);

const port=process.env.PORT||9000;

module.exports=app.listen(port,()=>{
    console.log(`Starting on http://localhost:${port}`)
})

function registerExtendRouter(){
    router.get('/extend/get',function(req,res){
        res.json({
            msg:'hello world'
        })
    })
    router.options('/extend/options',function(req,res){
        res.json({
            msg:'hello world options'
        })
    })
    router.delete('/extend/delete',function(req,res){
        res.json({
            msg:'hello world delete'
        })
    })
    router.head('/extend/head',function(req,res){
        res.json({
            msg:'hello world head'
        })
    })
    router.post('/extend/post',function(req,res){
        res.json(req.body)
    })
    router.put('/extend/put',function(req,res){
        res.json({
            msg:'hello world put'
        })
    })
    router.patch('/extend/patch',function(req,res){
        res.json({
            msg:'hello world patch'
        })
    })
}

function registerMoreRouter(){
    router.get('/more/get',function(req,res){
        res.json({
            msg:'hello world'
        })
    }) 
}