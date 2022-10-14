Popper.js源码解析

# Popper.js是什么？

Popper.js是一个专门用于定位元素的一个js库，在vue-popper、react-popper中均有使用，可以说是一个非常底层的库了。

# Popper.js功能

Popper.js可以实现正确的定位元素，不停的迭代处理了大量的边缘情况，如在滚动容器中、浏览器的兼容性和一些溢出以及裁剪的情况等。

# Popper.js使用

```js
//react版本
import React, { useEffect } from "react";
import { createPopper } from "@popperjs/core";

export default function Demo() {
  const buttonRef = React.useRef(null);

  const tooltipRef = React.useRef(null);

  useEffect(() => {
    createPopper(buttonRef.current, tooltipRef.current);
  }, []);

  return (
    <div
      style={{
        paddingTop: 100,
        paddingLeft: 100
      }}
    >
      <div style={{ paddingTop: 100, paddingLeft: 100 }}>
        <button ref={buttonRef}>我只是一个按钮</button>
        <div ref={tooltipRef}>我只是一个tooltip</div>
      </div>
    </div>
  );
} 
```

>[在线codesandbox运行链接](https://codesandbox.io/s/interesting-morning-xrzlhs?file=/src/App.js:0-581)，可以清楚的看到“我只是一个tooltip”div被成功的定位到了“我只是一个按钮”的这个按钮上的底部了。我们可以看到这个div除了absolute、left、right等定位相关的css外并没有添加额外的样式，它的作用也只有一个，那就是定位元素。

>本文使用不做过多介绍，具体可以查看他的[官网](https://popper.js.org/)

# Popper.js源码解析

从[github](https://github.com/floating-ui/floating-ui/tree/v2.x)上拉取相应代码。

从目录上我们就可以看出核心源码都在src下面，由于popper.js采用的是flow工具进行静态编译检查，所以使用vs code打开会有很多错误，我们可以尝试着将flow相关的代码进行删除，以方便我们查看。
 
## 1.popperGenerator函数

在createPopper.js文件中，我们找到popperGenerator函数，这是此库的核心函数 ，上述例子中@popperjs/core导出的createPopper函数就是他返回的

```js

const INVALID_ELEMENT_ERROR='Popper:Invalid reference or popper argument provided.They must be either a DOM element or virtual element.';
const INFINITE_LOOP_ERROR =
  'Popper: An infinite loop in the modifiers cycle has been detected! The cycle has been interrupted to prevent a browser crash.';


const DEFAULT_OPTIONS={
  //定位元素默认位置为bottom,即底部
  placement:'bottom',
  //插件为空
  modifiers:[],
  //定位策略默认为absolute
  strategy:'absolute'
}

export function popperGenerator(generatorOptions={}){
  	const {
      defaultModifiers=[],
      defaultOptions=DEFAULT_OPTIONS
    }=generatorOptions;
    
    return function createPopper(
    		reference,
       	popper,
        options=defaultOptions
    ){
      //全局state状态
      let state={
        //默认为底部
        placement:'bottom',
        //默认可以自定义扩展，所以需要进行排序
        orderedModifiers:[],
        //可选项
        options:{...DEFAULT_OPTIONS,...defaultOptions},
        //通过modifiers计算出来的数据等，存储起来方便后续使用
        modifiersData:{},
        //存储定位以及被定位元素
        elements:{
          reference,
          popper
        },
        //存储属性
        attributes:{},
        //存储样式
        styles:{}
      };
      
      //存储一些副作用函数，便于以后清除，如后续我们会讲到的监听以及移除监听
      let effectCleanupFns=[];
      //定义popper实例是否已经销毁
      let isDestroyed=false;
      
      //popper实例 此函数返回此实例
      const instance={
        state,
        //在低评率下使用forceUpdate 但是经过我测试并无实质性差别
        forceUpdate(){
          if(isDestroyed){
            return ;
          }
          const {reference,popper}=state.elements;
          //如果有一个不是元素 直接返回 不进行任何操作
          if(!areValidElements(reference,popper)){
            if(__DEV__){
              console.error(INVALID_ELEMENT_ERROR);
              return ;
            }
          }
          
          //存储popper和reference 相比较于offsetaParent的rect 以便于modifier进行读取
          state.rects={
            reference:getCompositeRect(
            	reference,
              getOffsetParent(popper),
              state.options.strategy==='fixed'
            ),
            popper:getLayoutRect(popper)
          }
          
          //**
          state.reset=false;
          //记录位置
          state.placement = state.options.placement;
          //记录更新值
          state.orderedModifiers.forEach(
            (modifier) =>
              (state.modifiersData[modifier.name] = {
                ...modifier.data,
              })
          );
          let __debug_loops__ = 0;
          for (let index = 0; index < state.orderedModifiers.length; index++) {
            if (__DEV__) {
              __debug_loops__ += 1;
              //调用次数过多会导致异常 给予提示
              if (__debug_loops__ > 100) {
                console.error(INFINITE_LOOP_ERROR);
                break;
              }
            }
            if (state.reset === true) {
            	state.reset = false;
	            index = -1;
  	          continue;
    	      }
            //获取对应的属性
            const { fn, options = {}, name } = state.orderedModifiers[index];
            if(typeof fn==='function'){
              //核心代码 在此执行对应的modifier函数
              state=fn({state,options,name,instance}) || state;
            }
          }
        },
        //更新方法 主要用于设置元素最新定位 官方声明在高频率方法中使用update 如scroll 
        update:debounce(
        	()=>new Promise((resolve)=>{
            //在低频率下使用forceUpdate 
            instance.forceUpdate();
            resolve(state);
          })
        ),
        setOptions(setOptionsAction){
          const options=typeof setOptionsAction==='function'
          	?setOptionsAction(state.options)
          	:setOptionsAction;
          
          //每次初始化popper实例时，清除一些副作用函数
          cleanupModifierEffects();
          //设置state所有的options
          state.options={
            ...defaultOptions,
            ...state.options,
            ...options
          };
          //获取父祖先们的滚动dom 便于后期添加事件监听等
          state.scrollParents={
            reference:isElement(reference)
            	?listScrollParents(reference)
            	:reference.contextElement
            	?listScrollParents(reference.contextElement)
            	:[],
            popper: listScrollParents(popper),
          };
          //根据他们的依赖项和phase进行排序
          const orderedModifiers=orderModifiers(
            //通过名字合并modifiers
            mergeByName([...defaultModifiers,...state.options.modifiers])
          );
          //剔除禁用的modifier
          state.orderedModifiers=orderedModifiers.filter(m=>m.enabled);
          if(__DEV__){
            //去除重复name的modifier 这里不是很理解 因为上面已经去过一次重了
            const modifiers=uniqueBy(
            	[...orderedModifiers,...state.options.modifiers],
              ({name})=>name
            );
            //验证modifiers属性合法性
            validateModifiers(modifiers);
            
            if(getBasePlacement(state.options.placement)===auto){
              const flipModifier=state.orderModiflers.find(
              	({name})=>name==='flip'
              );
              //如果是auto定位 filp modifier是必须的
              if (!flipModifier) {
                console.error(
                  [
                    'Popper: "auto" placements require the "flip" modifier be',
                    'present and enabled to work.',
                  ].join(' ')
                );
              }
            }
            
            const {
              marginLeft,
              marginRight,
              marginBottom,
              marginLeft
            }=getComputedStyle(popper);
            //我们不再考虑popper的margin 因为可能会对定位产生影响
            if (
              [marginTop, marginRight, marginBottom, marginLeft].some((margin) =>
                parseFloat(margin)
              )
            ) {
              console.warn(
                [
                  'Popper: CSS "margin" styles cannot be used to apply padding',
                  'between the popper and its reference element or boundary.',
                  'To replicate margin, use the `offset` modifier, as well as',
                  'the `padding` option in the `preventOverflow` and `flip`',
                  'modifiers.',
                ].join(' ')
              );
          	}
            runModifierEffects();
            
            return instance.update();
          }
        }
      };
      
      if(!areValidElements(reference,popper)){
        //开发模式下如果不是节点 直接会报错 不会设置定位的一些方法
        if(__DEV__){
          console.error(INVALID_ELEMENT_ERROR);
        }
        return instance;
      }
      
      instance.setOptions(options).then((state)=>{
        //更新完执行onFistUpdate
        if(!isDestroyed && options.onFirstUpdate){
          options.onFirstUpdate(state);
        }
      })
      //执行副作用代码并向effectCleanupFns数组中添加cleanup方法
      function runModifierEffects(){ 
        state.orderedModifiers.forEach((name,options={},effect)=>{
          if(typeof effect==='function'){
            const cleanupFn=effect({state,name,instance,options});
          }
        })
      }
      //执行clean方法
      function cleanupModifierEffects(){
        effectCleanupFns.forEach(fn=>fn());
        effectCleanupFns=[];
      }
      //返回实例
      return instance;
    }
}
```

## 2. createPopper

那么createPopper这个函数究竟做了什么操作呢？

1. 根据入参整合了一份state作为全局对象为全局共用，其中设置了一些属性如element、scrollParents比较关键
2. 设置完初始state以后会执行modifiers的effect effect相当于modifier的副作用函数
3. 依次执行modifier获得需要的各个数据并赋值
4. 最后一步把计算好的样式设置在dom节点上

# Modifiers

> 其实这个库的核心就是modifiers 每个modifier相当于一个插件一样 可以随意拔插 可以任意扩展 所有计算位置都是由modifier进行计算的

## 1.phase

> 相当于popperjs中的生命周期 popperjs中一共有9个阶段  依次为beforeRead=>read=>afterRead=>beforeMain=>main=>afterMain=>beforeWrite=>afterWrite=>afterWrite 

由英文可以看出来是读->纯计算->写

## 2.modifier执行的顺序

> 根据phase阶段和require可以得出modifier的执行顺序分别为popperOffsets=>offset=>flip=>preventOverflow=>arrow=>hide=>computeStyles=>eventListeners=>applyStyles


## 3. popperOffsets

> 这个modifier的作用就是计算element需要设置的偏移量如x、y等

