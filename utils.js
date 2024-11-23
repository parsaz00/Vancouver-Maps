/** 
 * Sanitization function 
 * Description - Sanitizes values from class 
 * Make sure we do not have values like ) ( ; etc 
 * Easy way to do this is via regex
 * @function sanitization
 * @param {string} inputString - input string for user
 * @returns {boolean} - a true false statement
*/
function sanitization(inputString){
    // be aware of the following
    // DROP TABLE Students; --  (from the comic in class)
    // 'admin' <for the search query>
    const regex_pattern = /[;()\-"']/;
    if(regex_pattern.test(inputString)){
        return false;
    }
    return true;
}

module.exports = {
    sanitization
};