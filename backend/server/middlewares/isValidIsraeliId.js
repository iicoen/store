
function isValidIsraeliId(id) {
    
    let sum = 0;
    for (let i = 0; i < 9; i++) {
        let num = Number(id[i]) * ((i % 2) + 1); // כפל בסדר לסירוגין: 1 ו-2
        if (num > 9) {
            num -= 9; // אם התוצאה היא יותר מ-9, מחסרים 9
        }
        sum += num;
    }

    // המספר תקין אם סכום הספרות מתחלק ב-10
    return sum % 10 === 0;
}

module.exports = { isValidIsraeliId };
