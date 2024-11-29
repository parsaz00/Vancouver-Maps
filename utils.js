/** 
 * Sanitization / Security Function 
 * Sanitizes any user input to prevent SQL Injection attacks by preventing special characters and common sql characters
 * - Injections prevented include: (Cases found here: on Codeacademy prevent SQL injection linked below)
 * DROP TABLE; --
 * Union Based Injections as (;, --) are prevented 
 * Error Based Injections as ((, ), ;, -) are prevented 
 * Boolean Based Injections as (', -) are prevented 
 * Time Based Injections as ((, -, ')) ar prevented
 * @function sanitization
 * @param {string} inputString - input string from user / router request 
 * @returns {boolean} - a true false statement indicating if inputString is approved
*/
function sanitization(inputString){
    /**
     * Prevents any special characters for input string 
     * Includes ;, (, ), -, \, ", '
     * This list is comprised from this source:
     * https://www.codecademy.com/learn/seasp-defending-node-applications-from-sql-injection-xss-csrf-attacks/modules/seasp-preventing-sql-injection-attacks/cheatsheet
     */
    const regex_pattern = /[;()\-"']/;
    if(regex_pattern.test(inputString)){
        return false;
    }
    return true;
}

/**
 * Alternative sanitization function for inserts since dates have "-" 
 * @param {*} inputString - input string from user / router request
 * @returns {boolean} - a true false statement indicating if inputString is approved
 */
function insertSanitization(inputString){
    const regex_pattern = /[;()\"']/;
    if(regex_pattern.test(inputString)){
        return false;
    }
    return true;
}


module.exports = {
    sanitization,
    insertSanitization
};