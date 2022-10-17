# 起因

已经颓废了很久 因为实在不知道写啥了  突然我某个同事对我说
宝哥 你看这个页面好多console.log 不仅会影响性能 而且可能会被不法分子所利用 我觉得很有道理
所以我萌生了写一个小插件来去除生产环境的console.log的想法 

# 介绍

我们笼统的介绍下babel，之前我有一篇写精度插件的babel文章，babel一共有三个阶段：第一阶段是将源代码转化为ast语法树、第二阶段是对ast语法树进行修改，生成我们想要的语法树、第三阶段是将ast语法树解析，生成对应的目标代码。

# 窥探

我们的目的是去除console.log，我们首先需要通过[ast](https://www.astexplorer.net/)查看语法树的结构。我们以下面的console为例：


> 注意 因为我们要写babel插件 所以我们选择@babel/parser库生成ast

```js
console.log("我会被清除"); 
```

# 初见AST

AST是对源码的抽象，字面量、标识符、表达式、语句、模块语法、class语法都有各自的AST。

我们这里只说下本文章中所使用的AST。


## Program

> program 是代表整个程序的节点，它有 body 属性代表程序体，存放 statement 数组，就是具体执行的语句的集合。 

可以看到我们这里的body只有一个ExpressionStatement语句，即console.log。

## ExpressionStatement

> statement 是语句，它是可以独立执行的单位，expression是表达式，它俩唯一的区别是表达式执行完以后有返回值。所以ExpressionStatement表示这个表达式是被当作语句执行的。

ExpressionStatement类型的AST有一个expression属性，代表当前的表达式。

## CallExpression

> expression 是表达式，CallExpression表示调用表达式，console.log就是一个调用表达式。
 
CallExpression类型的AST有一个callee属性，指向被调用的函数。这里console.log就是callee的值。

CallExpression类型的AST有一个arguments属性，指向参数。这里“我会被清除”就是arguments的值。

## MemberExpression

> Member Expression通常是用于访问对象成员的。他有几种形式：

```js
a.b
a["b"]
new.target
super.b
```

我们这里的console.log就是访问对象成员log。

* 为什么MemberExpression外层有一个CallExpression呢？

实际上，我们可以理解为，MemberExpression中的某一子结构具有函数调用，那么整个表达式就成为了一个Call Expression。

MemberExpression有一个属性object表示被访问的对象。这里console就是object的值。

MemberExpression有一个属性property表示对象的属性。这里log就是property的值。

MemberExpression有一个属性computed表示访问对象是何种方式。computed为true表示[],false表示. 。

## Identifier

> Identifer 是标识符的意思，变量名、属性名、参数名等各种声明和引用的名字，都是Identifer。

我们这里的console就是一个identifier。

Identifier有一个属性name 表示标识符的名字

## StringLiteral

> 表示字符串字面量。

我们这里的log就是一个字符串字面量

StringLiteral有一个属性value 表示字符串的值

# 如何写一个babel插件？

babel插件是作用在第二阶段即transform阶段。

transform阶段有@babel/traverse，可以遍历AST，并调用visitor函数修改AST。

我们可以新建一个js文件，其中导出一个方法，返回一个对象，对象存在一个visitor属性，里面可以编写我们具体需要修改AST的逻辑。

```diff
+ export default () => {
+  return {
+    name: "@parrotjs/babel-plugin-console",
+    visitor,
+  };
+ };
```

# 构造visitor方法

> path 是记录遍历路径的 api，它记录了父子节点的引用，还有很多增删改查 AST 的 api

```diff
+ const visitor = { 
+   CallExpression(path, { opts }) {
+    //当traverse遍历到类型为CallExpression的AST时，会进入函数，我们需要在函数内部修改
+  }
+ };
```

> 我们需要遍历所有调用函数表达式 所以使用CallExpression。

# 去除所有console

我们将所有的console.log去掉

> path.get 表示获取某个属性的path 

```diff
CallExpression(path, { opts }) {
+  //获取callee的path
+  const calleePath = path.get("callee"); 
  
},
```
