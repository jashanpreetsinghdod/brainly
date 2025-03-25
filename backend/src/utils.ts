export function random(len:number){
    const sel="qwertyuiopasdfghjklzxcvbnm1234567890";
    const length=sel.length;
    
    let ans="";

    for(let i=0;i<len;i++){
        ans+=sel[Math.floor(Math.random()*length)];
    }

    return ans;
}