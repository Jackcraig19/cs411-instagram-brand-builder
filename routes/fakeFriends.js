const router = require('express').Router()
const sql = require('../helpers/db')

router.get('/', async (req, res) => {
    const reqQuery = req.query
    let errorMsgs = []
    let windowData = []
    if (simpleValidate(reqQuery, ['usr', 'fame'])) {
        let query = `CALL GetFakeFriends("${reqQuery.usr}", ${reqQuery.fame})`
        try {
            const reqQuery = await sql.query(query)
            for (const row of reqQuery[0]) {
                windowData.push({username: row.username})
            }
            
        } catch (e) {
            console.error(e)
            errorMsgs.push('Operation Failed!')
            errorMsgs.push(e.message)
        }
    }
    res.render('fakeFriends', {errors: errorMsgs, windowData:windowData})
})


const simpleValidate = (query, vals) => {
    for (const val of vals) {
        if (!query.hasOwnProperty(val) || query[val] === '') {
            return false
        }
    }
    return true
}

module.exports = router