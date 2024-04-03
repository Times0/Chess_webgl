import {Chess} from './Chess';
import UNIT_TEST from './dataTest.json'

let c = new Chess(false);

Object.keys(UNIT_TEST).forEach(name =>{
    const test = UNIT_TEST[name];

    c.reset();
    let result,
        str = name;
    
    for(let cmd of test['input'])
    {
        let t = c.move(cmd);
        if(t !== null)
            result = t;
    }

    if(result === test['output'])
        str = str.concat(' ==== PASSED');
    else
    {
        console.log(test['output']);
        console.log(result);
        str = str.concat(' ==== FAILED');
    }
    console.log(str);
});