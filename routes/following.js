const router = require('express').Router()
const sql = require('../helpers/db')

router.get('/', async (req, res) => {
    const reqQuery = req.query
    let errorMsgs = []
    let windowData = []
    switch (reqQuery.qt) {
        case 'create':
            // TODO: Better Validation
            if (simpleValidate(reqQuery, ['username', 'following_account'])) {
                let query = `INSERT INTO following (username, following_account) VALUES ("${reqQuery.username}",
                "${reqQuery.following_account}");`
                try {
                    await sql.query(query)
                    windowData.push({
                        username: reqQuery.username,
                        following_account: reqQuery.following_account
                    })
                } catch (e) {
                    console.error(e)
                    errorMsgs.push('Operation Failed!')
                    errorMsgs.push(e.message)
                }
            }
            break
        case 'search':
            // TODO: Better Validation
            if (simpleValidate(reqQuery, ['usr'])) {
                let query = `SELECT * FROM following WHERE username LIKE "%${reqQuery.usr.trim()}%";`
                try {
                    const queryResult = await sql.query(query)
                    for (const row of queryResult) {
                        windowData.push(row)
                    }
                } catch(e) {
                    console.error(e)
                    errorMsgs.push('Operation Failed!')
                    errorMsgs.push(e.message)
                }
            }
            break
        case 'delete':
            if (simpleValidate(reqQuery, ['username', 'following_account'])) {
                let query = `DELETE FROM following WHERE username="${reqQuery.username}" AND following_account="${reqQuery.following_account}";`
                try {
                    const queryResult = await sql.query(query)
                    if (queryResult.affectedRows == 0) {
                        errorMsgs.push('Operation Failed!')
                        errorMsgs.push('No Rows Found!')
                    }
                } catch(e) {
                    console.error(e)
                    errorMsgs.push('Operation Failed!')
                    errorMsgs.push(e.message)
                }
            }
            break
        }
    const r = await sql.query('SELECT COUNT(*) AS numPosts FROM following LIMIT 1;')
    res.render('following', {numPosts: r[0].numPosts, errors: errorMsgs, windowData:windowData})
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