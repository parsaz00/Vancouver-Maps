/*
const db = ('oracledb');
//wait on this function because of end to end
//async function validateAttribute
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
*/
function tokenizer(input_string){
    // Trimming the string to deal with "   hi!"
    const input_string_trim = input_string.trim();
    const l_string = input_string_trim.length;
    const tokens = [];
    let curr = ""; 
    // if we have " " it's a little different in SQL
    let appostrophe_indicator = false;

    for(var i = 0; i < l_string; i++){
        if(!appostrophe_indicator){
            if(input_string_trim[i] == '"'){
                appostrophe_indicator = true;
                curr = curr + input_string_trim[i];
            }
            else if(input_string_trim[i] != " "){
                curr = curr + input_string_trim[i];
            } else {
                if(curr != ""){
                    tokens.push(curr);
                    curr = "";
                }
            }
        } else {
            if(input_string_trim[i] != '"'){
                curr = curr + input_string_trim[i];
            } else {
                if(curr != ''){
                    curr = curr + input_string_trim[i];
                    tokens.push(curr);
                    curr = "";
                    appostrophe_indicator = false; 
                }
            }
        }
    }

    return tokens;
}

//for testing purposes 
let test_token = tokenizer('Input = "trash can" and why = "no one maybe"')
console.log(test_token)
