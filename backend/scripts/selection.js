const db = ('oracledb');
//this needs to wait for our core account
async function validateAttribute()

function setSelect(input, table) {
    // Set all the input to tokens
    const tokens = input.match("/\S+/g");
    const conditions = [];
    // Set hashmaps for validation
    let currentCondition = {};
    let currentAndOr = null;

    // Validate input 
    for(let i = 0; i < tokens.length; i++){
        // Check mods etc to validate for each 
        if(i % 4 == 0){
            if(!validateAttribute.includes(tokens[i])) {
                throw new Error(`Invalid attribute: ${tokens[i]}`);
            }
            currentCondition.attribute = tokens[i];
    }


}
