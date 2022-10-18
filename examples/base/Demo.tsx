import React, { useEffect } from "react"; 
 
export default function Demo() { 

  console.log("测试1");
  //no remove
  console.log("测试2"); 
  console.log("测试3");//reserve
  console.log("测试4");

  return (
    <div
      style={{
        paddingTop: 100,
        paddingLeft: 100
      }}
    >
      <div style={{ paddingTop: 100, paddingLeft: 100 }}> 
        测试
      </div>
    </div>
  );
} 